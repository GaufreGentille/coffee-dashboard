// pins.mjs — posts "épinglés" par l'admin : mis en avant en haut du feed,
// exemptés de la fenêtre des 2 semaines, jusqu'à dépublication manuelle.
// GET  → épingles uniquement pour les membres connectés / collecteur secret
// POST → action pin/unpin (header x-admin-key) ou refresh (header x-veille-secret, script hebdo)
import { getStore } from "@netlify/blobs";
import { isMember, isCollector, isVeilleAdmin, headerMatches, privateHeaders } from "../lib/member-auth.mjs";
import { attenteRestante, noterEchec, reponseBloquee } from "../lib/limiteur.mjs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: privateHeaders,
  });

export default async (req) => {
  const store = getStore({ name: "insta-veille", consistency: "strong" });

  if (req.method === "GET") {
    if (!isCollector(req) && !await isMember(req)) return json({ error: "Connexion requise" }, 401);
    const pins = (await store.get("pins", { type: "json" })) || {};
    return json(pins);
  }

  if (req.method !== "POST") return json({ error: "GET ou POST uniquement" }, 405);

  const attente = await attenteRestante(req, "admin");
  if (attente > 0) return reponseBloquee(attente);
  const okAdmin = isVeilleAdmin(req);
  const okScript = headerMatches(req, "x-veille-secret", process.env.VEILLE_SECRET, 1);
  if (!okAdmin && !okScript) {
    await noterEchec(req, "admin");
    return json({ error: "non autorisé" }, 401);
  }

  let body;
  try { body = await req.json(); } catch { return json({ error: "JSON invalide" }, 400); }

  const pins = (await store.get("pins", { type: "json" })) || {};

  switch (body.action) {
    case "pin": {
      const it = body.item;
      if (!it?.id || !/^\d{5,30}$/.test(String(it.id))) return json({ error: "item invalide" }, 400);
      // Le lien finit dans un href : on n'accepte qu'Instagram, jamais javascript: & co.
      if (it.permalink && !/^https:\/\/(www\.)?instagram\.com\//.test(String(it.permalink))) {
        return json({ error: "permalink invalide" }, 400);
      }
      pins[it.id] = { ...it, pinnedAt: pins[it.id]?.pinnedAt || new Date().toISOString() };
      await store.setJSON("pins", pins);
      return json({ ok: true, count: Object.keys(pins).length });
    }

    case "unpin": {
      if (!pins[body.postId]) return json({ error: "épingle introuvable" }, 404);
      delete pins[body.postId];
      await store.setJSON("pins", pins);
      return json({ ok: true, count: Object.keys(pins).length });
    }

    case "refresh": {
      // utilisé par le script hebdo pour rafraîchir les URLs d'images des épingles
      if (!body.pins || typeof body.pins !== "object" || Array.isArray(body.pins)) {
        return json({ error: "pins invalide" }, 400);
      }
      await store.setJSON("pins", body.pins);
      return json({ ok: true, count: Object.keys(body.pins).length });
    }

    default:
      return json({ error: "action inconnue" }, 400);
  }
};
