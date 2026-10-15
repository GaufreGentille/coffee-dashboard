// Flux de la Veille réservé aux membres connectés et au collecteur interne.
import { getStore } from '@netlify/blobs'
import { isMember, isCollector, privateJson } from '../lib/member-auth.mjs'

export default async (request) => {
  if (request.method !== 'GET') return privateJson({ error: 'GET uniquement' }, 405)
  if (!isCollector(request) && !await isMember(request)) {
    return privateJson({ error: 'Connexion requise pour consulter la Veille' }, 401)
  }
  try {
    const store = getStore({ name: 'insta-veille', consistency: 'strong' })
    const feed = await store.get('feed', { type: 'json' })
    return privateJson(feed || { fetchedAt: null, stats: null, accounts: [] })
  } catch (e) {
    console.error('Veille indisponible:', e)
    return privateJson({ error: 'Veille momentanément indisponible' }, 500)
  }
}
