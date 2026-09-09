// netlify/lib/feeds.mjs
// Stockage des flux dans Netlify Blobs + service HTTP avec cache CDN.
//
// Principe : les crons écrivent, les functions get-* lisent. Une lecture
// normale ne fait plus aucun appel réseau sortant.
//
// Aucune dépendance hors @netlify/blobs. Le cache CDN expire tout seul
// au bout d'une heure, il n'y a donc pas de purge à déclencher après un cron.

import { getStore } from '@netlify/blobs'

const STORE_NAME = 'kissa-feeds'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function store() {
  return getStore({ name: STORE_NAME, consistency: 'strong' })
}

function json(payload, status = 200, extra = {}) {
  return new Response(JSON.stringify(payload), { status, headers: { ...CORS, ...extra } })
}

export async function readFeed(key) {
  try {
    return await store().get(key, { type: 'json' })
  } catch (e) {
    console.error('blob read KO:', key, e.message)
    return null
  }
}

export async function writeFeed(key, data) {
  const record = { data, generatedAt: new Date().toISOString() }
  await store().setJSON(key, record)
  return record
}

// Reconstruit un flux et l'écrit en blob.
export async function refreshFeed(key, build) {
  const data = await build()
  return writeFeed(key, data)
}

/**
 * Sert un flux depuis le blob.
 *   key       clé du blob
 *   build     builder utilisé en secours si le blob est vide
 *   transform post-traitement appliqué à chaque lecture (ex. statuts origines)
 *   maxAge    durée du cache CDN en secondes
 */
export async function serveFeed(req, { key, build, transform, maxAge = 3600 }) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...CORS, 'Access-Control-Allow-Headers': '*' } })
  }

  const force = new URL(req.url).searchParams.get('refresh') === '1'
  let record = force ? null : await readFeed(key)
  let origin = 'blob'

  if (!record) {
    try {
      record = await refreshFeed(key, build)
      origin = force ? 'refresh' : 'cold'
    } catch (err) {
      // Le build a échoué : on ressert le blob existant plutôt que rien.
      const fallback = await readFeed(key)
      if (!fallback) {
        console.error('feed KO sans secours:', key, err.message)
        return json({ error: err.message }, 500, { 'X-Feed': 'error' })
      }
      record = fallback
      origin = 'stale'
    }
  }

  let payload
  try {
    payload = transform ? transform(record.data) : record.data
  } catch (err) {
    console.error('transform KO:', key, err.message)
    payload = record.data
  }

  return json({ ...payload, generatedAt: record.generatedAt }, 200, {
    'Netlify-CDN-Cache-Control': force
      ? 'no-store'
      : `public, durable, s-maxage=${maxAge}, stale-while-revalidate=86400`,
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'X-Feed': origin,
  })
}

// Corps commun des fonctions planifiées.
export async function runCron(key, build) {
  const t0 = Date.now()
  try {
    const record = await refreshFeed(key, build)
    console.log(`cron ${key} OK en ${Date.now() - t0} ms, genere le ${record.generatedAt}`)
  } catch (err) {
    console.error(`cron ${key} KO apres ${Date.now() - t0} ms :`, err.message)
  }
  return new Response('ok')
}
