// vote.mjs — votes Hot/Cold de la communauté sur les posts de la veille.
// GET  ?user=<id>  → { counts: {postId:{u,d}}, mine: {postId: 1|-1} }
// POST { postId, dir: 1|-1|0, userId, pseudo } → { ok, u, d }
//
// Stockage : Blob "votes" = { [postId]: { u, d, v: {userId: dir}, t: firstVoteTs } }
// Identité légère : userId généré côté navigateur (localStorage), pseudo déclaratif.
//
// LIMITE ASSUMÉE : cette identité n'en est pas une, le navigateur fabrique son
// propre identifiant. Un script qui en génère mille votera mille fois. Ce qui
// suit ne rend pas le vote honnête, ça empêche seulement qu'on casse la
// fonctionnalité pour de bon en saturant le blob.
import { getStore } from "@netlify/blobs";
import { cors, origineConnue } from "../lib/auth.mjs";

const MAX_POSTS_TRACKED = 3000;  // au-delà, on purge les votes les plus anciens
const MAX_VOTANTS_PAR_POST = 800; // au-delà, plus de nouveau votant sur ce post
const VOTES_PAR_IP_PAR_MINUTE = 20;

// Compteur par IP. Il vit dans l'instance et disparaît avec elle : ça freine
// le script naïf, pas l'attaquant patient. C'est un ralentisseur, pas un mur.
const compteurs = new Map();

function tropRapide(ip) {
  if (!ip) return false;
  const maintenant = Date.now();
  const c = compteurs.get(ip);
  if (!c || maintenant - c.debut > 60_000) {
    compteurs.set(ip, { debut: maintenant, n: 1 });
    if (compteurs.size > 5000) compteurs.clear(); // borne mémoire
    return false;
  }
  c.n += 1;
  return c.n > VOTES_PAR_IP_PAR_MINUTE;
}

export default async (req) => {
  const enTetes = { "Content-Type": "application/json", ...cors(req) };
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: enTetes });

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { ...enTetes, "Access-Control-Allow-Headers": "*" } });
  }

  const store = getStore({ name: "insta-veille", consistency: "strong" });

  if (req.method === "GET") {
    const votes = (await store.get("votes", { type: "json" })) || {};
    const url = new URL(req.url);
    const userId = url.searchParams.get("user");
    const counts = {};
    const mine = {};
    for (const [postId, rec] of Object.entries(votes)) {
      counts[postId] = { u: rec.u || 0, d: rec.d || 0 };
      if (userId && rec.v?.[userId]) mine[postId] = rec.v[userId];
    }
    return json({ counts, mine });
  }

  if (req.method !== "POST") return json({ error: "GET ou POST uniquement" }, 405);

  if (!origineConnue(req)) return json({ error: "origine non autorisee" }, 403);

  const ip = req.headers.get("x-nf-client-connection-ip") || "";
  if (tropRapide(ip)) return json({ error: "trop de votes, reessaie dans une minute" }, 429);

  let body;
  try { body = await req.json(); } catch { return json({ error: "JSON invalide" }, 400); }

  const { postId, dir, userId, pseudo } = body;

  // ── Validations ──
  if (!/^\d{5,30}$/.test(String(postId || ""))) return json({ error: "postId invalide" }, 400);
  if (![1, -1, 0].includes(dir)) return json({ error: "dir doit être 1, -1 ou 0" }, 400);
  if (!/^[a-zA-Z0-9-]{10,50}$/.test(String(userId || ""))) return json({ error: "userId invalide" }, 400);
  const cleanPseudo = String(pseudo || "").trim().slice(0, 20);
  if (cleanPseudo.length < 2) return json({ error: "pseudo requis (2-20 caractères)" }, 400);

  const votes = (await store.get("votes", { type: "json" })) || {};
  const rec = votes[postId] || { u: 0, d: 0, v: {}, t: Date.now() };

  const prev = rec.v[userId] || 0;
  if (prev === dir) {
    // rien à changer (double-clic, requête rejouée…)
    return json({ ok: true, u: rec.u, d: rec.d, mine: dir });
  }

  // Plafond de votants par post : sans lui, la carte v grossit sans fin
  // jusqu'à ce que le blob dépasse la taille maximale et que plus aucune
  // écriture ne passe, y compris les légitimes.
  if (!prev && dir !== 0 && Object.keys(rec.v).length >= MAX_VOTANTS_PAR_POST) {
    return json({ error: "trop de votes sur ce post" }, 429);
  }

  // retirer l'ancien vote
  if (prev === 1) rec.u = Math.max(0, rec.u - 1);
  if (prev === -1) rec.d = Math.max(0, rec.d - 1);
  // appliquer le nouveau
  if (dir === 1) rec.u += 1;
  if (dir === -1) rec.d += 1;
  if (dir === 0) delete rec.v[userId];
  else rec.v[userId] = dir;

  votes[postId] = rec;

  // ── Purge des entrées les plus anciennes si trop volumineux ──
  const ids = Object.keys(votes);
  if (ids.length > MAX_POSTS_TRACKED) {
    ids
      .sort((a, b) => (votes[a].t || 0) - (votes[b].t || 0))
      .slice(0, ids.length - MAX_POSTS_TRACKED)
      .forEach((id) => delete votes[id]);
  }

  await store.setJSON("votes", votes);
  return json({ ok: true, u: rec.u, d: rec.d, mine: dir });
};
