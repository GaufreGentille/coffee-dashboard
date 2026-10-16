// insta-media.mjs : copies locales des visuels de la Veille Instagram.
//
// Pourquoi : les URLs renvoyées par l'API Meta (scontent / cdninstagram) sont
// signées et expirent au bout de quelques jours, et le CDN Instagram refuse
// souvent l'affichage depuis un autre site. Le script hebdo télécharge donc
// chaque visuel au moment où l'URL est encore fraîche et le dépose ici.
//
//   GET  ?k=p-<idPost> | ?k=a-<handle>   → l'image (public, mis en cache CDN)
//   GET  ?list=1                          → clés stockées (collecteur seulement)
//   POST ?k=...   corps = octets de l'image → dépôt (collecteur seulement)
//   POST ?prune=1 { keep: [clés] }         → supprime tout le reste (collecteur)
import { getStore } from "@netlify/blobs";
import { headerMatches, privateJson } from "../lib/member-auth.mjs";

const KEY_RX = /^(p-\d{5,30}|a-[a-z0-9._]{1,30})$/;
const TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);
const MAX_BYTES = 3 * 1024 * 1024;

const store = () => getStore({ name: "insta-media", consistency: "strong" });
const isCollector = (req) =>
  headerMatches(req, "x-veille-secret", process.env.VEILLE_SECRET, 1);

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("k") || "";

  if (req.method === "GET" && url.searchParams.get("list") === "1") {
    if (!isCollector(req)) return privateJson({ error: "non autorisé" }, 401);
    const { blobs } = await store().list();
    return privateJson({ keys: blobs.map((b) => b.key) });
  }

  if (req.method === "GET") {
    if (!KEY_RX.test(key)) return new Response("clé invalide", { status: 400 });
    const hit = await store().getWithMetadata(key, { type: "arrayBuffer" });
    if (!hit) {
      return new Response("introuvable", {
        status: 404,
        headers: { "Cache-Control": "public, max-age=300" },
      });
    }
    const type = TYPES.has(hit.metadata?.type) ? hit.metadata.type : "image/jpeg";
    // Un post ne change jamais d'image ; un avatar si, d'où un cache plus court.
    const cache = key.startsWith("p-")
      ? "public, max-age=31536000, immutable"
      : "public, max-age=86400";
    return new Response(hit.data, {
      headers: {
        "Content-Type": type,
        "Cache-Control": cache,
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  if (req.method !== "POST") return privateJson({ error: "GET ou POST uniquement" }, 405);
  if (!isCollector(req)) return privateJson({ error: "non autorisé" }, 401);

  if (url.searchParams.get("prune") === "1") {
    let body;
    try { body = await req.json(); } catch { return privateJson({ error: "JSON invalide" }, 400); }
    if (!Array.isArray(body?.keep)) return privateJson({ error: "keep doit être un tableau" }, 400);
    const keep = new Set(body.keep);
    // Garde-fou : une liste vide viderait tout le stock.
    if (keep.size === 0) return privateJson({ error: "keep vide, purge refusée" }, 400);
    const s = store();
    const { blobs } = await s.list();
    let removed = 0;
    for (const b of blobs) {
      if (!keep.has(b.key)) { await s.delete(b.key); removed++; }
    }
    return privateJson({ ok: true, kept: blobs.length - removed, removed });
  }

  if (!KEY_RX.test(key)) return privateJson({ error: "clé invalide" }, 400);
  const type = (req.headers.get("content-type") || "").split(";")[0].trim();
  if (!TYPES.has(type)) return privateJson({ error: "type d'image refusé" }, 415);
  const bytes = await req.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) {
    return privateJson({ error: "taille invalide" }, 413);
  }
  await store().set(key, bytes, { metadata: { type } });
  return privateJson({ ok: true, key, bytes: bytes.byteLength });
};
