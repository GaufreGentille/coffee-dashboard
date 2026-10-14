-- Veille désormais réservée aux comptes Supabase authentifiés.
-- Les statistiques de votes du forum restent publiques.
-- Les statistiques de Veille ne doivent plus être consultables sans session.
revoke execute on function public.ks_watch_stats() from public, anon;
grant execute on function public.ks_watch_stats() to authenticated;
