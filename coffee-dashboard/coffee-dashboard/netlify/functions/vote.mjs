// Ancienne API de votes anonymes, désactivée.
// Les votes de Veille visuelle passent désormais exclusivement par Supabase
// (ks_watch_votes + RLS liée à auth.uid()). Les anciens blobs restent archivés.
export default async (request) => {
  return new Response(JSON.stringify({
    erreur: 'Cette API de vote est fermée. Connectez-vous à Kissa Soko pour voter.'
  }), {
    status: 410,
    headers: { 'content-type':'application/json', 'cache-control':'no-store' }
  })
}
