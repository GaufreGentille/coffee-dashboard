// Ajoute la session Supabase aux requêtes privées vers les fonctions Netlify.
import { communityDb } from './communityClient'

export async function memberFetch(url, options = {}) {
  if (!communityDb) throw new Error('Connexion des membres indisponible.')
  const { data, error } = await communityDb.auth.getSession()
  if (error || !data?.session?.access_token) {
    throw new Error('Session expirée. Reconnecte-toi pour consulter la Veille.')
  }
  const headers = new Headers(options.headers || {})
  headers.set('Authorization', `Bearer ${data.session.access_token}`)
  const response = await fetch(url, { ...options, headers, cache: 'no-store' })
  if (response.status === 401) throw new Error('Session expirée. Reconnecte-toi pour consulter la Veille.')
  return response
}
