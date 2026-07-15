// vote.mjs — votes Hot/Cold de la communauté sur les posts de la veille.
// GET  ?user=<id>  → { counts: {postId:{u,d}}, mine: {postId: 1|-1} }
// POST { postId, dir: 1|-1|0, userId, pseudo } → { ok, u, d }
//
// Stockage : Blob "votes" = { [postId]: { u, d, v: {userId: dir}, t: firstVoteTs } }
// Identité légère : userId généré côté navigateur (localStorage), pseudo déclaratif.
import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const MAX_POSTS_TRACKED = 3000; // au-delà, on purge les votes les plus anciens

export default async (req) => {
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
