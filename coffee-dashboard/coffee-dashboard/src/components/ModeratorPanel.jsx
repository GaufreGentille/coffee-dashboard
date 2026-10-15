import { useCallback, useEffect, useState } from 'react'
import { communityDb } from '../lib/communityClient'
import { useCommunityAuth } from './CommunityAuth'

const formatDate = value => new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })

// Aucun pouvoir d'administration dans le navigateur : chaque opération est
// validée par les politiques RLS de Supabase.
export default function ModeratorPanel({ onChanged }) {
  const { user } = useCommunityAuth()
  const [allowed, setAllowed] = useState(false)
  const [reports, setReports] = useState([])
  const [details, setDetails] = useState({})
  const [expanded, setExpanded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    const { data, error: err } = await communityDb.from('ks_reports')
      .select('id,topic_id,comment_id,reason,created_at,status')
      .order('created_at', { ascending: false }).limit(100)
    if (err) throw err
    const rows = data || []
    setReports(rows)
    const ids = rows.filter(r => r.topic_id).map(r => r.topic_id)
    const commentIds = rows.filter(r => r.comment_id).map(r => r.comment_id)
    const [topics, comments] = await Promise.all([
      ids.length ? communityDb.from('ks_topics').select('id,title,body').in('id',ids)
        : Promise.resolve({ data: [], error: null }),
      commentIds.length ? communityDb.from('ks_comments').select('id,body').in('id',commentIds)
        : Promise.resolve({ data: [], error: null })
    ])
    if (topics.error) throw topics.error
    if (comments.error) throw comments.error
    setDetails(Object.fromEntries([...(topics.data || []).map(v => ['topic:'+v.id, v.title]),
      ...(comments.data || []).map(v => ['comment:'+v.id, v.body])]))
  }, [])

  useEffect(() => {
    let active = true
    setAllowed(false)
    setExpanded(false)
    setReports([])
    if (!user?.id || !communityDb) return () => { active = false }
    communityDb.rpc('ks_is_moderator').then(async ({ data, error: err }) => {
      if (!active || err || data !== true) return
      setAllowed(true)
      try { await reload() } catch (e) { if (active) setError(e.message || 'Signalements indisponibles.') }
    })
    return () => { active = false }
  }, [user?.id, reload])

  const act = async (item, kind) => {
    const remove = kind === 'remove'
    const target = item.topic_id ? 'sujet' : 'réponse'
    if (remove && !window.confirm(`Supprimer définitivement ce ${target} signalé ?`)) return
    setBusy(true); setError('')
    try {
      const outcome = remove
        ? await communityDb.from(item.topic_id ? 'ks_topics' : 'ks_comments').delete()
          .eq('id', item.topic_id || item.comment_id)
        : await communityDb.from('ks_reports').update({
          status: kind === 'dismiss' ? 'dismissed' : 'reviewed',
          resolved_at: new Date().toISOString()
        }).eq('id', item.id)
      if (outcome.error) throw outcome.error
      await reload()
      if (remove) onChanged?.()
    } catch (e) {
      setError(e.message || 'Action refusée.')
    } finally { setBusy(false) }
  }

  if (!allowed) return null
  const open = reports.filter(r => r.status === 'open')
  return (
    <section className="ks-mod-panel" aria-label="Modération du Comptoir">
      <button className="ks-mod-toggle" type="button" aria-expanded={expanded}
        onClick={() => setExpanded(v => !v)}>
        Modération · {open.length} signalement{open.length !== 1 ? 's' : ''} à traiter {expanded ? '−' : '+'}
      </button>
      {expanded && <div className="ks-mod-body">
        <p>Réservé aux modérateurs. Les actions sont contrôlées par Supabase.</p>
        {error && <p className="ks-form-error" role="alert">{error}</p>}
        {open.length === 0 ? <p>Aucun signalement en attente.</p>
          : open.map(item => (
            <article className="ks-mod-report" key={item.id}>
              <small>{formatDate(item.created_at)} · {item.topic_id ? 'Sujet' : 'Réponse'}</small>
              <strong>{details[(item.topic_id ? 'topic:' + item.topic_id : 'comment:' + item.comment_id)]?.slice(0,180) || 'Contenu indisponible'}</strong>
              <p>Motif : {item.reason}</p>
              <div className="ks-mod-actions">
                <button type="button" disabled={busy} onClick={() => act(item, 'remove')}>Supprimer le contenu</button>
                <button type="button" disabled={busy} onClick={() => act(item, 'reviewed')}>Marquer traité</button>
                <button type="button" disabled={busy} onClick={() => act(item, 'dismiss')}>Rejeter le signalement</button>
              </div>
            </article>
          ))}
      </div>}
    </section>
  )
}
