import { createClient } from '@supabase/supabase-js'

// Valeurs publiques de Supabase uniquement. NE JAMAIS utiliser service_role dans Vite.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const communityConfigured = Boolean(url && key)
export const communityDb = communityConfigured
  ? createClient(url, key, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
    })
  : null
