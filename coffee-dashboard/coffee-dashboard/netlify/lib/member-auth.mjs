// Authentification pour les lectures privées de Veille.
// Netlify Functions valide le jeton Supabase auprès du serveur Auth,
// pas seulement l'état de la session côté navigateur.
import { createClient } from '@supabase/supabase-js'
import { memeChaine } from './auth.mjs'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

const authClient = url && key
  ? createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    })
  : null

export async function isMember(request) {
  if (!authClient) return false
  const value = request.headers.get('authorization') || ''
  const bearer = /^Bearer\s+([^\s]+)$/i.exec(value)
  if (!bearer) return false
  try {
    const { data, error } = await authClient.auth.getUser(bearer[1])
    return !error && Boolean(data?.user?.id)
  } catch {
    return false
  }
}

// Compare un en-tête à un secret d'environnement, à temps constant.
// Un secret absent ou trop court refuse toujours.
export function headerMatches(request, header, expected, minLength = 16) {
  if (typeof expected !== 'string' || expected.length < minLength) return false
  return memeChaine(request.headers.get(header) || '', expected)
}

// Uniquement pour le collecteur GitHub Actions, jamais dans le navigateur.
// Le script doit pouvoir lire le flux précédent et rafraîchir les épingles.
export function isCollector(request) {
  return headerMatches(request, 'x-veille-secret', process.env.VEILLE_SECRET)
}

// Clé admin du panneau Veille (épingles, liste des comptes).
export function isVeilleAdmin(request) {
  return headerMatches(request, 'x-admin-key', process.env.VEILLE_ADMIN_KEY, 1)
}

export const privateHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'private, no-store',
  'Vary': 'Authorization, x-veille-secret'
}

export function privateJson(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: privateHeaders })
}
