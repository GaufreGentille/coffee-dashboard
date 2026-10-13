import { useCallback, useEffect, useMemo, useState } from 'react'
import { communityConfigured, communityDb } from '../lib/communityClient'
import { MemberBar, useCommunityAuth } from './CommunityAuth'

const CATEGORIES = [
  { id: 'tous', label: 'Tout le comptoir' },
  { id: 'discussion', label: 'Discussions' },
  { id: 'questions', label: 'Questions' },
  { id: 'extraction', label: 'Extraction' },
  { id: 'torrefaction', label: 'Torréfaction' },
  { id: 'origines', label: 'Origines' },
  { id: 'materiel', label: 'Matériel' },
]
const labelCat = name => CATEGORIES.find(c => c.id === name)?.label || 'Discussion'
const dateFR = date => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
const nameOf = record => record?.author?.display_name || 'Membre'

export default function CommunityPage() {
  const { user, requireAuth } = useCommunityAuth()
  const [topics, setTopics] = useState([])
  const [stats, setStats] = useState({})
  const [selected, setSelected] = useState(null)
  const [newTopic, setNewTopic] = useState(false)
  const [category, setCategory] = useState('tous')
  const [sort, setSort] = useState('new')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!communityDb) return
    setBusy(true); setError('')
    try {
      const [posts, counters] = await Promise.all([
        communityDb.from('ks_topics')
          .select('id,title,body,category,created_at,author_id,locked,author:ks_profiles!ks_topics_author_id_fkey(display_name)')
          .order('created_at', { ascending: false }).limit(100),
        communityDb.rpc('ks_topic_stats')
      ])
      if (posts.error) throw posts.error
      if (counters.error) throw counters.error
      setTopics(posts.data || [])
      setStats(Object.fromEntries((counters.data || []).map(s => [s.topic_id, s])))
    } catch (e) { setError(e.message || 'Impossible de charger les discussions.') }
    finally { setBusy(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh, user?.id])

  const visible = useMemo(() => {
    const rows = category === 'tous' ? topics : topics.filter(t => t.category === category)
    return [...rows].sort((a,b) =>
      sort === 'top'
        ? (Number(stats[b.id]?.score || 0) - Number(stats[a.id]?.score || 0)) || Date.parse(b.created_at)-Date.parse(a.created_at)
        : Date.parse(b.created_at)-Date.parse(a.created_at))
  }, [topics, category, sort, stats])

  const vote = async (post, direction) => {
    if (!requireAuth()) return
    const current = stats[post.id]?.mine || 0
    const target = current === direction ? 0 : direction
    try {
      const res = target === 0
        ? await communityDb.from('ks_topic_votes').delete().eq('topic_id', post.id).eq('user_id', user.id)
        : await communityDb.from('ks_topic_votes').upsert({
          topic_id: post.id, user_id: user.id, direction: target
        }, { onConflict: 'topic_id,user_id' })
      if (res.error) throw res.error
      await refresh()
    } catch(e) { setError(e.message || 'Le vote a échoué.') }
  }

  const submitTopic = async values => {
    if (!requireAuth()) return
    const { data, error: err } = await communityDb.from('ks_topics').insert({
      ...values, author_id: user.id
    }).select('id').single()
    if (err) throw err
    setNewTopic(false)
    await refresh()
    setSelected(data.id)
  }

  const report = async (type, id) => {
    if (!requireAuth()) return
    const reason = window.prompt('Pourquoi souhaites-tu signaler ce contenu ? (5 caractères minimum)')
    if (reason == null) return
    if (reason.trim().length < 5) { setError('Le motif du signalement doit contenir au moins 5 caractères.'); return }
    const { error: err } = await communityDb.from('ks_reports').insert({
      reporter_id: user.id, reason: reason.trim().slice(0,500),
      ...(type === 'topic' ? { topic_id: id } : { comment_id: id })
    })
    if (err) setError(err.message)
    else window.alert('Signalement transmis. Merci !')
  }

  return (
    <section className="ks-forum">
      <div className="ks-forum-heading">
        <p className="ks-forum-eyebrow">L'ESPACE DES PASSIONNÉS</p>
        <h1>Le Comptoir<span>.</span></h1>
        <p>Questions pointues, curiosités, découvertes. On discute café sans barrière à l'entrée.</p>
      </div>
      <MemberBar />
      {error && <div className="ks-forum-alert" role="alert">{error} <button type="button" onClick={()=>setError('')}>Fermer</button></div>}
      <div className="ks-forum-toolbar">
        <nav className="ks-forum-filters" aria-label="Catégories des discussions">
          {CATEGORIES.map(c => <button type="button" key={c.id} aria-pressed={category===c.id}
            className={category===c.id ? 'is-active' : ''} onClick={()=>{setCategory(c.id);setSelected(null)}}>
            {c.label}
          </button>)}
        </nav>
        <button className="ks-primary-action" type="button" onClick={()=>{if(requireAuth())setNewTopic(true)}}>+ Nouvelle discussion</button>
      </div>
      {selected ? (
        <TopicDetail
          id={selected} topic={topics.find(t=>t.id===selected)} stats={stats[selected]}
          onBack={()=>{setSelected(null);refresh()}} vote={vote} report={report}
        />
      ) : (
        <>
          <div className="ks-forum-sort">
            <span>{visible.length} discussion{visible.length>1?'s':''}</span>
            <label>Classer par
              <select value={sort} onChange={e=>setSort(e.target.value)}>
                <option value="new">Les plus récentes</option>
                <option value="top">Les mieux notées</option>
              </select>
            </label>
          </div>
          {!communityConfigured ? (
            <div className="ks-forum-empty"><h2>Le Comptoir prend forme.</h2>
              <p>Les discussions publiques apparaîtront ici dès que la base Supabase aura été connectée au site.</p></div>
          ) : busy && !topics.length ? (
            <div className="ks-forum-empty">Chargement des discussions…</div>
          ) : !visible.length ? (
            <div className="ks-forum-empty"><h2>La première tasse est à servir.</h2>
              <p>Aucune discussion dans cette catégorie. À toi d'ouvrir le sujet !</p></div>
          ) : (
            <div className="ks-forum-list">
              {visible.map(t=><article className="ks-topic" key={t.id}>
                <VoteColumn score={stats[t.id]?.score || 0} mine={stats[t.id]?.mine || 0} onVote={dir=>vote(t,dir)} />
                <button className="ks-topic-content" type="button" onClick={()=>setSelected(t.id)}>
                  <span className="ks-topic-cat">{labelCat(t.category)}</span>
                  <h2>{t.title}</h2>
                  <p>{t.body.length>220 ? t.body.slice(0,217)+'…' : t.body}</p>
                  <span className="ks-topic-meta">par {nameOf(t)} · {dateFR(t.created_at)} · {stats[t.id]?.comments || 0} réponses</span>
                </button>
              </article>)}
            </div>
          )}
        </>
      )}
      {newTopic && <TopicComposer onClose={()=>setNewTopic(false)} onSubmit={submitTopic}/>}
    </section>
  )
}

function VoteColumn({score, mine, onVote}) {
  return <div className="ks-vote-column" aria-label={`Score ${score}`}>
    <button type="button" className={mine===1?'is-active':''} aria-label="Vote positif" aria-pressed={mine===1} onClick={()=>onVote(1)}>▲</button>
    <strong>{score}</strong>
    <button type="button" className={mine===-1?'is-active':''} aria-label="Vote négatif" aria-pressed={mine===-1} onClick={()=>onVote(-1)}>▼</button>
  </div>
}

function TopicComposer({ onClose, onSubmit }) {
  const [title,setTitle]=useState('')
  const [body,setBody]=useState('')
  const [category,setCategory]=useState('discussion')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const save=async e=>{
    e.preventDefault();setBusy(true);setError('')
    try { await onSubmit({title:title.trim(),body:body.trim(),category}) }
    catch(e) {setError(e.message||'Impossible de publier.')}
    finally {setBusy(false)}
  }
  return <div className="ks-auth-scrim" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className="ks-auth-modal ks-topic-composer" role="dialog" aria-modal="true" aria-label="Nouvelle discussion">
      <button type="button" className="ks-auth-close" onClick={onClose} aria-label="Fermer">×</button>
      <p className="ks-forum-eyebrow">UNE IDÉE À PARTAGER ?</p><h2>Ouvre la discussion.</h2>
      <form onSubmit={save}>
        <label>Catégorie <select value={category} onChange={e=>setCategory(e.target.value)}>
          {CATEGORIES.filter(c=>c.id!=='tous').map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
        </select></label>
        <label>Titre <input required minLength={8} maxLength={140} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Une question sur la fermentation…"/></label>
        <label>Ton message <textarea required minLength={10} maxLength={10000} rows={8} value={body} onChange={e=>setBody(e.target.value)} placeholder="Raconte-nous…"/></label>
        {error && <p className="ks-form-error" role="alert">{error}</p>}
        <button className="ks-primary-action" type="submit" disabled={busy}>{busy?'Publication…':'Publier la discussion →'}</button>
      </form>
    </section>
  </div>
}

function TopicDetail({id,topic,stats,onBack,vote,report}) {
  const {user,requireAuth}=useCommunityAuth()
  const [comments,setComments]=useState([])
  const [reply,setReply]=useState('')
  const [replyTo,setReplyTo]=useState(null)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const load=useCallback(async()=>{
    if(!communityDb)return
    const {data,error:err}=await communityDb.from('ks_comments')
      .select('id,topic_id,parent_id,body,author_id,created_at,author:ks_profiles!ks_comments_author_id_fkey(display_name)')
      .eq('topic_id',id).order('created_at',{ascending:true}).limit(500)
    if(err)setError(err.message);else setComments(data||[])
  },[id])
  useEffect(()=>{load()},[load])
  if(!topic)return <div className="ks-forum-empty"><button onClick={onBack}>← Retour aux discussions</button> Cette discussion n'est plus disponible.</div>
  const send=async e=>{
    e.preventDefault()
    if(!requireAuth())return
    setBusy(true);setError('')
    const {error:err}=await communityDb.from('ks_comments').insert({
      topic_id:id,author_id:user.id,body:reply.trim(),parent_id:replyTo
    })
    if(err)setError(err.message)
    else {setReply('');setReplyTo(null);await load()}
    setBusy(false)
  }
  const remove=async(type,itemId)=>{
    if(!window.confirm('Supprimer définitivement ce contenu ?'))return
    const {error:err}=await communityDb.from(type==='topic'?'ks_topics':'ks_comments')
      .delete().eq('id',itemId)
    if(err)setError(err.message)
    else if(type==='topic')onBack();else load()
  }
  const replies=parent=>comments.filter(c=>c.parent_id===parent)
  const render=(parent=null,depth=0)=>replies(parent).map(c=><div key={c.id} className={depth?'ks-comment is-reply':'ks-comment'}>
    <div className="ks-comment-meta"><strong>{nameOf(c)}</strong> · {dateFR(c.created_at)}</div>
    <p>{c.body}</p>
    <div className="ks-comment-actions">
      {depth<3&&<button type="button" onClick={()=>{if(requireAuth()){setReplyTo(c.id);document.getElementById('ks-reply-editor')?.focus()}}}>Répondre</button>}
      <button type="button" onClick={()=>report('comment',c.id)}>Signaler</button>
      {user?.id===c.author_id&&<button type="button" onClick={()=>remove('comment',c.id)}>Supprimer</button>}
    </div>
    {depth<4&&render(c.id,depth+1)}
  </div>)
  return <article className="ks-thread">
    <button className="ks-back-link" type="button" onClick={onBack}>← Toutes les discussions</button>
    <div className="ks-thread-heading">
      <VoteColumn score={stats?.score||0} mine={stats?.mine||0} onVote={dir=>vote(topic,dir)}/>
      <div><span className="ks-topic-cat">{labelCat(topic.category)}</span>
        <h2>{topic.title}</h2>
        <span className="ks-topic-meta">par {nameOf(topic)} · {dateFR(topic.created_at)}</span></div>
    </div>
    <p className="ks-thread-body">{topic.body}</p>
    <div className="ks-comment-actions">
      <button type="button" onClick={()=>report('topic',topic.id)}>Signaler le sujet</button>
      {user?.id===topic.author_id&&<button type="button" onClick={()=>remove('topic',topic.id)}>Supprimer mon sujet</button>}
    </div>
    <h3>{comments.length} réponse{comments.length>1?'s':''}</h3>
    {render()}
    {error&&<p className="ks-form-error" role="alert">{error}</p>}
    {topic.locked?<p>Cette discussion est verrouillée.</p>:<form className="ks-reply-editor" onSubmit={send}>
      <label htmlFor="ks-reply-editor">{replyTo?'Répondre à un commentaire':'Participer à la discussion'}</label>
      {replyTo&&<button type="button" onClick={()=>setReplyTo(null)}>Annuler la réponse imbriquée ×</button>}
      <textarea id="ks-reply-editor" minLength={2} maxLength={5000} rows={4}
        value={reply} onChange={e=>setReply(e.target.value)} required
        placeholder={user?'Ta réponse…':'Connecte-toi pour participer…'}/>
      <button className="ks-primary-action" type="submit" disabled={busy}>{busy?'Envoi…':'Répondre →'}</button>
    </form>}
  </article>
}
