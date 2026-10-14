// Authentification pour les lectures privées de Veille.
// Netlify Functions valide le jeton Supabase auprès du serveur Auth,
// pas seulement l'état de la session côté navigateur.
import { createClient } from '@supabase/supabase-js'

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

// Uniquement pour le collecteur GitHub Actions, jamais dans le navigateur.
// Le script doit pouvoir lire le flux précédent et rafraîchir les épingles.
export function isCollector(request) {
  const expected = process.env.VEILLE_SECRET
  return typeof expected === 'string' && expected.length >= 16 &&
    request.headers.get('x-veille-secret') === expected
}

export const privateHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'private, no-store',
  'Vary': 'Authorization, x-veille-secret'
}

export function privateJson(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: privateHeaders })
}
