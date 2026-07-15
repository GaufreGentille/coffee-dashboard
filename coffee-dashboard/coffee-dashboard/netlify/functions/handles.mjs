// handles.mjs — gestion de la liste des comptes Instagram à surveiller.
// GET  → liste complète (publique : utilisée par le script de veille et le panneau admin)
// POST → modifications, protégées par le header x-admin-key (env VEILLE_ADMIN_KEY)
//        actions : ping | add | remove | replace
import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// handle Instagram valide : minuscules, chiffres, points, underscores, 1-30 caractères
function normalizeHandle(raw) {
  const h = String(raw || "").trim().toLowerCase().replace(/^@/, "");
  return /^[a-z0-9._]{1,30}$/.test(h) ? h : null;
}

export default async (req) => {
  const store = getStore({ name: "insta-veille", consistency: "strong" });

  if (req.method === "GET") {
    const list = await store.get("handles", { type: "json" });
    return json(Array.isArray(list) ? list : []);
  }

  if (req.method !== "POST") return json({ error: "GET ou POST uniquement" }, 405);

  // ── Auth admin ──
  const adminKey = process.env.VEILLE_ADMIN_KEY;
  if (!adminKey || req.headers.get("x-admin-key") !== adminKey) {
    return json({ error: "non autorisé" }, 401);
  }

  let body;
  try { body = await req.json(); } catch { return json({ error: "JSON invalide" }, 400); }

  const current = (await store.get("handles", { type: "json" })) || [];

  switch (body.action) {
    case "ping":
      // sert juste à vérifier le mot de passe admin depuis le panneau
      return json({ ok: true, count: current.length });

    case "add": {
      const handle = normalizeHandle(body.entry?.handle);
      if (!handle) return json({ error: "handle invalide" }, 400);
      if (current.some((e) => e.handle === handle)) {
        return json({ error: `@${handle} est déjà dans la liste` }, 409);
      }
      const entry = {
        handle,
        name: String(body.entry?.name || handle).trim().slice(0, 60),
        category: String(body.entry?.category || "Autre").trim().slice(0, 30),
      };
      const updated = [...current, entry];
      await store.setJSON("handles", updated);
      return json({ ok: true, count: updated.length, added: entry });
    }

    case "remove": {
      const handle = normalizeHandle(body.handle);
      if (!handle) return json({ error: "handle invalide" }, 400);
      const updated = current.filter((e) => e.handle !== handle);
      if (updated.length === current.length) {
        return json({ error: `@${handle} introuvable dans la liste` }, 404);
      }
      await store.setJSON("handles", updated);
      return json({ ok: true, count: updated.length, removed: handle });
    }

    case "replace": {
      // import en masse (utilisé pour le seed initial des 452 comptes)
      if (!Array.isArray(body.list)) return json({ error: "list doit être un tableau" }, 400);
      const seen = new Set();
      const cleaned = [];
      for (const e of body.list) {
        const handle = normalizeHandle(e?.handle);
        if (!handle || seen.has(handle)) continue;
        seen.add(handle);
        cleaned.push({
          handle,
          name: String(e?.name || handle).trim().slice(0, 60),
          category: String(e?.category || "Autre").trim().slice(0, 30),
        });
      }
      await store.setJSON("handles", cleaned);
      return json({ ok: true, count: cleaned.length });
    }

    default:
      return json({ error: "action inconnue" }, 400);
  }
};
