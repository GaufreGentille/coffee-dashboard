// ─────────────────────────────────────────────────────────────────────────────
// Kissa Soko — Veille Instagram via Business Discovery API (Meta Graph)
// Exécuté quotidiennement par GitHub Actions (.github/workflows/instagram-veille.yml)
//
// Env requis :
//   IG_USER_ID      → ID Instagram Business du compte de veille
//   IG_ACCESS_TOKEN → token longue durée (60 jours)
//   VEILLE_SECRET   → secret partagé avec la Netlify Function insta-store
// Env optionnel :
//   VEILLE_PUSH_URL → défaut : https://kissasoko.netlify.app/.netlify/functions/insta-store
//   VEILLE_READ_URL → défaut : https://kissasoko.netlify.app/.netlify/functions/get-insta
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";

const IG_USER_ID = process.env.IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const VEILLE_SECRET = process.env.VEILLE_SECRET;
const PUSH_URL =
  process.env.VEILLE_PUSH_URL ||
  "https://kissasoko.netlify.app/.netlify/functions/insta-store";
const READ_URL =
  process.env.VEILLE_READ_URL ||
  "https://kissasoko.netlify.app/.netlify/functions/get-insta";

if (!IG_USER_ID || !IG_ACCESS_TOKEN || !VEILLE_SECRET) {
  console.error("❌ Variables manquantes : IG_USER_ID / IG_ACCESS_TOKEN / VEILLE_SECRET");
  process.exit(1);
}

const GRAPH = "https://graph.facebook.com/v25.0";
const THROTTLE_MS = 19_000; // ~189 appels/heure, sous le plafond de 200/h
const MAX_POSTS = 4;
const MAX_CAPTION = 350;
const MAX_FAILS = 3; // au-delà, le compte est skippé (retenté le dimanche)

const HANDLES_PATH = new URL(
  "../coffee-dashboard/coffee-dashboard/src/data/insta-handles.json",
  import.meta.url
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function trimCaption(c) {
  if (!c) return "";
  const clean = c.replace(/\s+/g, " ").trim();
  return clean.length > MAX_CAPTION ? clean.slice(0, MAX_CAPTION - 1) + "…" : clean;
}

// Erreurs "définitives" = compte perso, introuvable, restreint → skip-list
function isPermanentError(err) {
  const msg = (err?.message || "").toLowerCase();
  return (
    err?.code === 110 ||
    err?.code === 100 ||
    msg.includes("cannot be found") ||
    msg.includes("does not exist") ||
    msg.includes("unsupported get request")
  );
}

function isRateLimit(err) {
  return [4, 17, 32, 613].includes(err?.code);
}

async function fetchAccount(handle) {
  const fields =
    `business_discovery.username(${handle})` +
    `{username,name,profile_picture_url,followers_count,` +
    `media.limit(${MAX_POSTS}){caption,media_url,thumbnail_url,media_type,permalink,timestamp,like_count,comments_count}}`;
  const url = `${GRAPH}/${IG_USER_ID}?fields=${encodeURIComponent(fields)}&access_token=${IG_ACCESS_TOKEN}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw json.error;
  return json.business_discovery;
}

async function main() {
  const handles = JSON.parse(readFileSync(HANDLES_PATH, "utf8"));
  console.log(`📋 ${handles.length} comptes dans la liste de veille`);

  // État précédent → skip-list des comptes en échec répété
  const prevFails = new Map();
  try {
    const prev = await fetch(READ_URL).then((r) => (r.ok ? r.json() : null));
    if (prev?.accounts) {
      for (const a of prev.accounts) {
        if (a.failCount) prevFails.set(a.handle, a.failCount);
      }
      console.log(`ℹ️  État précédent chargé (${prevFails.size} comptes en skip-list)`);
    }
  } catch {
    console.log("ℹ️  Pas d'état précédent (premier run ?)");
  }

  const isSunday = new Date().getUTCDay() === 0; // le dimanche on retente tout
  const accounts = [];
  let ok = 0, failed = 0, skipped = 0;

  for (let i = 0; i < handles.length; i++) {
    const { handle, name, category } = handles[i];
    const prevFailCount = prevFails.get(handle) || 0;

    if (prevFailCount >= MAX_FAILS && !isSunday) {
      accounts.push({ handle, name, category, failCount: prevFailCount, skipped: true });
      skipped++;
      continue; // pas d'appel API → pas de throttle
    }

    try {
      const bd = await fetchAccount(handle);
      const posts = (bd.media?.data || []).map((m) => ({
        id: m.id,
        caption: trimCaption(m.caption),
        image: m.media_type === "VIDEO" ? (m.thumbnail_url || m.media_url) : m.media_url,
        type: m.media_type,
        permalink: m.permalink,
        timestamp: m.timestamp,
        likes: m.like_count ?? null,
        comments: m.comments_count ?? null,
      }));
      accounts.push({
        handle,
        name,
        category,
        igName: bd.name || bd.username,
        followers: bd.followers_count,
        profilePic: bd.profile_picture_url || null,
        posts,
        failCount: 0,
      });
      ok++;
    } catch (err) {
      if (isRateLimit(err)) {
        console.log(`⏸️  Rate limit atteint à ${handle} — pause de 15 minutes…`);
        await sleep(15 * 60 * 1000);
        i--; // on retente le même compte
        continue;
      }
      const failCount = isPermanentError(err) ? prevFailCount + 1 : prevFailCount;
      accounts.push({
        handle, name, category, failCount,
        lastError: err?.message?.slice(0, 120) || "unknown",
      });
      failed++;
    }

    if ((i + 1) % 25 === 0) {
      console.log(`… ${i + 1}/${handles.length} (ok:${ok} ko:${failed} skip:${skipped})`);
    }
    await sleep(THROTTLE_MS);
  }

  const payload = {
    fetchedAt: new Date().toISOString(),
    stats: { total: handles.length, ok, failed, skipped },
    accounts,
  };

  console.log(`\n📊 Terminé — ok:${ok} échecs:${failed} skippés:${skipped}`);
  console.log(`📦 Payload : ${(JSON.stringify(payload).length / 1024).toFixed(0)} Ko`);

  const push = await fetch(PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-veille-secret": VEILLE_SECRET,
    },
    body: JSON.stringify(payload),
  });

  if (!push.ok) {
    console.error(`❌ Échec du push vers Netlify : ${push.status} ${await push.text()}`);
    process.exit(1);
  }
  console.log("✅ Données poussées vers Netlify Blobs");
}

main().catch((e) => {
  console.error("❌ Erreur fatale :", e);
  process.exit(1);
});
