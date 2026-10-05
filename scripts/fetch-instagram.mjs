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

const HANDLES_URL =
  process.env.VEILLE_HANDLES_URL ||
  "https://kissasoko.netlify.app/.netlify/functions/handles";

const HANDLES_PATH = new URL(
  "../coffee-dashboard/coffee-dashboard/src/data/insta-handles.json",
  import.meta.url
);

// La liste vit dans Netlify Blobs (éditable depuis le panneau admin du dashboard).
// Le fichier JSON du repo ne sert que de secours si le Blob est vide/injoignable.
async function loadHandles() {
  try {
    const r = await fetch(HANDLES_URL);
    if (r.ok) {
      const list = await r.json();
      if (Array.isArray(list) && list.length > 0) {
        console.log(`📋 Liste chargée depuis Netlify (${list.length} comptes)`);
        return list;
      }
    }
  } catch { /* réseau KO → fallback */ }
  console.log("📋 Liste Netlify vide/injoignable — fallback sur le fichier du repo");
  return JSON.parse(readFileSync(HANDLES_PATH, "utf8"));
}

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

function isGlobalAuthError(err) {
  const msg = (err?.message || "").toLowerCase();
  return (
    err?.code === 190 ||
    err?.code === 102 ||
    msg.includes("invalid oauth access token") ||
    msg.includes("error validating access token") ||
    msg.includes("session has expired") ||
    msg.includes("access token")
  );
}

function formatMetaError(err) {
  return {
    message: err?.message || "unknown",
    type: err?.type || null,
    code: err?.code ?? null,
    subcode: err?.error_subcode ?? null,
    trace: err?.fbtrace_id || null,
  };
}

async function preflight() {
  const url =
    `${GRAPH}/${IG_USER_ID}` +
    `?fields=id,username&access_token=${IG_ACCESS_TOKEN}`;

  const res = await fetch(url);
  let json = null;

  try {
    json = await res.json();
  } catch {
    throw new Error(`Préflight Meta illisible (HTTP ${res.status})`);
  }

  if (!res.ok || json?.error) {
    const err = json?.error || {
      message: `HTTP ${res.status}`,
      code: res.status,
      type: "HTTPError",
    };
    console.error("❌ Préflight Meta KO :", JSON.stringify(formatMetaError(err)));
    throw err;
  }

  console.log(`✅ Préflight Meta OK — compte de veille ${json.username || json.id}`);
}

const PINS_URL =
  process.env.VEILLE_PINS_URL ||
  "https://kissasoko.netlify.app/.netlify/functions/pins";

async function fetchAccount(handle) {
  const fields =
    `business_discovery.username(${handle})` +
    `{username,name,profile_picture_url,followers_count,` +
    `media.limit(${MAX_POSTS}){caption,media_url,thumbnail_url,media_type,permalink,timestamp,like_count,comments_count}}`;
  const url = `${GRAPH}/${IG_USER_ID}?fields=${encodeURIComponent(fields)}&access_token=${IG_ACCESS_TOKEN}`;
  const res = await fetch(url);

  let json = null;
  try {
    json = await res.json();
  } catch {
    throw {
      message: `Réponse Meta illisible (HTTP ${res.status})`,
      code: res.status,
      type: "HTTPError",
    };
  }

  if (!res.ok || json?.error) {
    throw json?.error || {
      message: `HTTP ${res.status}`,
      code: res.status,
      type: "HTTPError",
    };
  }

  if (!json?.business_discovery) {
    throw {
      message: "Business Discovery absent de la réponse Meta",
      code: null,
      type: "BusinessDiscoveryError",
    };
  }

  return json.business_discovery;
}

// Fetch "profond" pour les épingles : remonte plus loin dans l'historique du compte
async function fetchAccountDeep(handle) {
  const fields =
    `business_discovery.username(${handle})` +
    `{media.limit(25){media_url,thumbnail_url,media_type,timestamp,like_count,comments_count}}`;
  const url = `${GRAPH}/${IG_USER_ID}?fields=${encodeURIComponent(fields)}&access_token=${IG_ACCESS_TOKEN}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw json.error;
  return json.business_discovery;
}

// Les URLs d'images CDN Instagram expirent en ~9 jours : les épingles vivent
// plusieurs semaines, donc on rafraîchit leurs images à chaque passage.
async function refreshPins() {
  let pins;
  try {
    pins = await fetch(PINS_URL).then((r) => (r.ok ? r.json() : null));
  } catch { return; }
  if (!pins || typeof pins !== "object") return;
  const ids = Object.keys(pins);
  if (!ids.length) return;

  console.log(`\n📌 Rafraîchissement de ${ids.length} épingle(s)…`);
  const byAccount = {};
  for (const id of ids) {
    const h = pins[id]?.account?.handle;
    if (h) (byAccount[h] ||= []).push(id);
  }

  for (const handle of Object.keys(byAccount)) {
    try {
      const bd = await fetchAccountDeep(handle);
      for (const m of bd.media?.data || []) {
        if (pins[m.id]) {
          pins[m.id].image =
            m.media_type === "VIDEO" ? (m.thumbnail_url || m.media_url) : m.media_url;
          if (m.like_count != null) pins[m.id].likes = m.like_count;
          if (m.comments_count != null) pins[m.id].comments = m.comments_count;
        }
      }
    } catch { /* compte injoignable → l'épingle garde ses données actuelles */ }
    await sleep(THROTTLE_MS);
  }

  const push = await fetch(PINS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-veille-secret": VEILLE_SECRET },
    body: JSON.stringify({ action: "refresh", pins }),
  });
  console.log(push.ok ? "📌 Épingles rafraîchies ✓" : `📌 Échec refresh épingles: ${push.status}`);
}

async function main() {
  await preflight();

  const handles = await loadHandles();
  console.log(`📋 ${handles.length} comptes dans la liste de veille`);

  // État précédent → skip-list des comptes en échec répété
  const prevFails = new Map();
  const prevAccounts = new Map();

  try {
    const prev = await fetch(READ_URL).then((r) => (r.ok ? r.json() : null));
    if (prev?.accounts) {
      for (const a of prev.accounts) {
        if (a?.handle) prevAccounts.set(a.handle, a);
        if (a?.failCount) prevFails.set(a.handle, a.failCount);
      }
      console.log(
        `ℹ️  État précédent chargé (${prevAccounts.size} comptes, ` +
        `${prevFails.size} en skip-list)`
      );
    }
  } catch {
    console.log("ℹ️  Pas d'état précédent (premier run ?)");
  }

  // Rythme hebdomadaire : on retente les comptes en skip-list une fois par mois
  // (lors du run tombant dans les 7 premiers jours du mois = 1er mardi)
  const isRetryRun = new Date().getUTCDate() <= 7;
  const accounts = [];
  let ok = 0, failed = 0, skipped = 0;

  for (let i = 0; i < handles.length; i++) {
    const { handle, name, category } = handles[i];
    const prevFailCount = prevFails.get(handle) || 0;

    if (prevFailCount >= MAX_FAILS && !isRetryRun) {
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

      const metaError = formatMetaError(err);

      if (isGlobalAuthError(err)) {
        console.error(
          `❌ Erreur Meta globale à ${handle} :`,
          JSON.stringify(metaError)
        );
        throw new Error(
          `Authentification Meta invalide. Code ${metaError.code ?? "?"}: ${metaError.message}`
        );
      }

      if (failed < 5 || (failed + 1) % 25 === 0) {
        console.warn(`⚠️  ${handle} KO :`, JSON.stringify(metaError));
      }

      const failCount = isPermanentError(err) ? prevFailCount + 1 : prevFailCount;
      const previous = prevAccounts.get(handle);

      accounts.push({
        ...(previous || {}),
        handle,
        name,
        category,
        failCount,
        lastError: metaError.message.slice(0, 120),
        stale: Boolean(previous),
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

  if (ok === 0) {
    console.error(
      "❌ Aucun compte Instagram récupéré. " +
      "Push Netlify annulé pour préserver les dernières données valides."
    );
    process.exit(1);
  }

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

  await refreshPins();
}

main().catch((e) => {
  console.error("❌ Erreur fatale :", e);
  process.exit(1);
});
