import { useState, useEffect, useCallback } from 'react'

const C = {
  bg:'#12141a', surf:'#1a1d25', surf2:'#20232d', surf3:'#262a35',
  border:'#282c38', border2:'#323748',
  text:'#dce0ed', dim:'#7a8099', faint:'#424858',
  gold:'#c4a264', goldDim:'#8a6e42', sage:'#7a9e78', slate:'#7a8fb5',
  red:'#be6f6f', green:'#74b074', orange:'#c4906a',
}

const TOPIC_COLORS = {
  marché:C.gold, culture:C.slate, durabilité:C.sage,
  compétition:'#c4847a', producteur:'#8aab8a', technique:C.slate, matériel:'#9a8fc4',
}
const CAT_COLORS = {
  Torréfacteur:C.gold, Café:C.slate, Producteur:C.sage,
  Barista:C.orange, Compétition:'#c4847a', Matériel:'#9a8fc4',
}
const SUB_COLORS = { 'r/espresso':C.gold, 'r/Coffee':C.orange, 'r/barista':C.sage }

const IMG = [
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80',
  'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=600&q=80',
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=80',
  'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&q=80',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80',
]
const SCI_IMG = [
  'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=400&q=80',
  'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&q=80',
  'https://images.unsplash.com/photo-1564325724739-bae0bd08762c?w=400&q=80',
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80',
  'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=400&q=80',
]

// Static Instagram accounts (curated — Meta API is closed)
const INSTAGRAM = [
  { handle:'onibuscoffee', name:'Onibus Coffee', category:'Torréfacteur', location:'Tokyo, JP', bio:'Specialty roaster & café — Tokyo. Farm trips, seasonal lots, pourover culture.', followers:'142K', avatar:'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80', url:'https://instagram.com/onibuscoffee', posts:['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75','https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75','https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75'] },
  { handle:'squaremilecoffee', name:'Square Mile Coffee', category:'Torréfacteur', location:'Londres, UK', bio:'Award-winning London roastery. Transparency, traceability, exceptional filter & espresso.', followers:'98K', avatar:'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80', url:'https://instagram.com/squaremilecoffee', posts:['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75','https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75','https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75'] },
  { handle:'cafekitsune', name:'Café Kitsuné', category:'Café', location:'Paris, FR', bio:'Le café spécialité parisien de référence. Origines sélectionnées, ambiance éditoriale.', followers:'87K', avatar:'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80', url:'https://instagram.com/cafekitsune', posts:['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75','https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75'] },
  { handle:'yirgacheffe_coop', name:'Yirgacheffe Cooperative', category:'Producteur', location:'Yirgacheffe, ET', bio:'Éthiopie — lots washed & naturels. Du caféier à la tasse, traçabilité totale.', followers:'34K', avatar:'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80', url:'https://instagram.com/yirgacheffecoop', posts:['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75','https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75','https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75'] },
  { handle:'worldbaristachamp', name:'World Barista Champ.', category:'Compétition', location:'Worldwide', bio:'Compte officiel WBC / WBrC / WCC — résultats, coulisses, highlights.', followers:'210K', avatar:'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80', url:'https://instagram.com/worldbaristachampionship', posts:['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75','https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75','https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75'] },
  { handle:'decentespresso', name:'Decent Espresso', category:'Matériel', location:'Hong Kong', bio:'Machine espresso DE2 — profils de pression programmables, data-driven extraction.', followers:'53K', avatar:'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80', url:'https://instagram.com/decentespresso', posts:['https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75','https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75','https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75'] },
  { handle:'mahlkoenig', name:'Mahlkönig', category:'Matériel', location:'Hamburg, DE', bio:'Moulins de référence — X68, E65S, EK43. Nouveautés 2026 et tips d\'utilisation.', followers:'79K', avatar:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80', url:'https://instagram.com/mahlkoenig', posts:['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75','https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75'] },
]

// ── Tiny components ───────────────────────────────────────

function Tag({ topic, lang }) {
  const color = TOPIC_COLORS[topic] || C.gold
  return (
    <div style={{ display:'flex', gap:5, alignItems:'center', flexWrap:'wrap' }}>
      <span style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color, background:color+'1a', border:`1px solid ${color}33`, borderRadius:4, padding:'2px 7px' }}>{topic}</span>
      {lang && <span style={{ fontSize:9, textTransform:'uppercase', color:C.faint, background:C.surf3, border:`1px solid ${C.border}`, borderRadius:3, padding:'2px 6px' }}>{lang==='fr'?'FR':'EN'}</span>}
    </div>
  )
}

function Spinner({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'24px 0', color:C.faint, fontSize:'0.8rem' }}>
      <div style={{ width:18, height:18, border:`2px solid ${C.border2}`, borderTopColor:C.gold, borderRadius:'50%', animation:'spin 0.7s linear infinite', flexShrink:0 }} />
      {label}
    </div>
  )
}

function ErrMsg({ msg }) {
  return <div style={{ color:C.red, fontSize:'0.78rem', padding:'16px', background:C.surf, border:`1px solid ${C.red}22`, borderRadius:8 }}>{msg}</div>
}

function HeroCard({ item }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target='_blank' rel='noopener noreferrer' style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:C.surf, border:`1px solid ${h?C.goldDim:C.border2}`, borderRadius:12, overflow:'hidden', marginBottom:10, cursor:'pointer', transition:'border-color 0.2s' }}>
        <div style={{ height:185, backgroundImage:`url(${IMG[0]})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${C.surf}f0 0%, ${C.surf}55 50%, transparent 100%)` }} />
          <div style={{ position:'absolute', bottom:14, left:18 }}><Tag topic={item.topic} lang={item.lang} /></div>
        </div>
        <div style={{ padding:'16px 18px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <span style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:C.gold }}>{item.source}</span>
            <span style={{ fontSize:9, color:C.faint }}>{item.date}</span>
          </div>
          <div style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem', fontWeight:700, color:C.text, lineHeight:1.35, marginBottom:10 }}>{item.title}</div>
          <div style={{ fontSize:'0.8rem', color:C.dim, lineHeight:1.65 }}>{item.summary}</div>
          <div style={{ marginTop:12, fontSize:'0.7rem', color:C.slate }}>Lire l'article →</div>
        </div>
      </div>
    </a>
  )
}

function NewsCard({ item, img, i }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target='_blank' rel='noopener noreferrer' style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:C.surf, border:`1px solid ${h?C.border2:C.border}`, borderRadius:10, overflow:'hidden', cursor:'pointer', transform:h?'translateY(-2px)':'translateY(0)', transition:'all 0.18s', animation:`fadeUp 0.35s ease ${i*70}ms both` }}>
        <div style={{ height:118, backgroundImage:`url(${img})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${C.surf}ee 0%, transparent 55%)` }} />
          <div style={{ position:'absolute', bottom:9, left:12 }}><Tag topic={item.topic} lang={item.lang} /></div>
        </div>
        <div style={{ padding:'12px 14px 15px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:C.gold }}>{item.source}</span>
            <span style={{ fontSize:9, color:C.faint }}>{item.date}</span>
          </div>
          <div style={{ fontSize:'0.84rem', fontWeight:600, color:C.text, lineHeight:1.38, marginBottom:6, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.title}</div>
          <div style={{ fontSize:'0.73rem', color:C.dim, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.summary}</div>
          <div style={{ marginTop:10, fontSize:'0.64rem', color:C.slate }}>Lire →</div>
        </div>
      </div>
    </a>
  )
}

function SciCard({ item, img, i }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target='_blank' rel='noopener noreferrer' style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:C.surf, border:`1px solid ${h?C.border2:C.border}`, borderRadius:10, overflow:'hidden', cursor:'pointer', display:'grid', gridTemplateColumns:'88px 1fr', animation:`fadeUp 0.35s ease ${i*80}ms both`, transition:'border-color 0.18s', minHeight:100 }}>
        <div style={{ backgroundImage:`url(${img})`, backgroundSize:'cover', backgroundPosition:'center', borderRight:`1px solid ${C.border}`, position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:`${C.bg}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>{item.emoji}</div>
        </div>
        <div style={{ padding:'13px 15px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:C.sage }}>{item.field}</span>
            <span style={{ fontSize:9, color:C.faint }}>{item.date}</span>
          </div>
          <div style={{ fontSize:9.5, color:C.dim, marginBottom:5, fontStyle:'italic' }}>{item.journal}</div>
          <div style={{ fontSize:'0.82rem', fontWeight:600, color:C.text, lineHeight:1.38, marginBottom:6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.title}</div>
          <div style={{ fontSize:'0.72rem', color:C.dim, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.abstract}</div>
          <div style={{ marginTop:8, fontSize:'0.63rem', color:C.slate }}>Voir l'article →</div>
        </div>
      </div>
    </a>
  )
}

function InstaCard({ account, i }) {
  const [h, setH] = useState(false)
  const catColor = CAT_COLORS[account.category] || C.gold
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:C.surf, border:`1px solid ${h?C.border2:C.border}`, borderRadius:12, overflow:'hidden', animation:`fadeUp 0.35s ease ${i*60}ms both`, transition:'all 0.18s' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:2, height:100 }}>
        {account.posts.map((p,pi)=>(
          <div key={pi} style={{ backgroundImage:`url(${p})`, backgroundSize:'cover', backgroundPosition:'center' }} />
        ))}
      </div>
      <div style={{ padding:'14px 14px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <div style={{ width:38, height:38, borderRadius:'50%', backgroundImage:`url(${account.avatar})`, backgroundSize:'cover', backgroundPosition:'center', border:`2px solid ${catColor}44`, flexShrink:0 }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'0.84rem', fontWeight:600, color:C.text }}>@{account.handle}</div>
            <div style={{ fontSize:9, color:C.faint, marginTop:1 }}>{account.location}</div>
          </div>
          <span style={{ fontSize:9, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:catColor, background:catColor+'18', border:`1px solid ${catColor}33`, borderRadius:4, padding:'2px 7px', flexShrink:0 }}>{account.category}</span>
        </div>
        <div style={{ fontSize:'0.78rem', color:C.dim, lineHeight:1.55, marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{account.bio}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:'0.72rem', color:C.faint }}>{account.followers} abonnés</span>
          <a href={account.url} target='_blank' rel='noopener noreferrer'
            style={{ background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color:'#fff', fontSize:'0.68rem', fontWeight:600, padding:'5px 12px', borderRadius:6, textDecoration:'none' }}>
            Voir le profil →
          </a>
        </div>
      </div>
    </div>
  )
}

function RedditCard({ post, i }) {
  const [h, setH] = useState(false)
  const subColor = SUB_COLORS[post.sub] || C.gold
  return (
    <a href={post.url} target='_blank' rel='noopener noreferrer' style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:C.surf, border:`1px solid ${h?C.border2:C.border}`, borderRadius:10, padding:'14px 16px', cursor:'pointer', transition:'all 0.18s', animation:`fadeUp 0.3s ease ${i*55}ms both`, transform:h?'translateX(3px)':'translateX(0)' }}>
        <div style={{ display:'flex', gap:12 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, minWidth:36 }}>
            <span style={{ fontSize:10, color:C.orange }}>▲</span>
            <span style={{ fontSize:'0.72rem', fontWeight:600, color:C.text }}>{post.upvotes}</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, flexWrap:'wrap' }}>
              <span style={{ fontSize:10, fontWeight:700, color:subColor, background:subColor+'18', border:`1px solid ${subColor}33`, borderRadius:4, padding:'1px 7px' }}>{post.sub}</span>
              {post.hot && <span style={{ fontSize:9, color:C.red, fontWeight:600 }}>🔥 Hot</span>}
              <span style={{ fontSize:9, background:C.surf3, border:`1px solid ${C.border}`, borderRadius:3, padding:'1px 6px', color:C.faint }}>{post.flair}</span>
            </div>
            <div style={{ fontSize:'0.87rem', fontWeight:600, color:C.text, lineHeight:1.4, marginBottom:8 }}>{post.title}</div>
            <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <span style={{ fontSize:'0.68rem', color:C.faint }}>{post.author}</span>
              <span style={{ fontSize:'0.68rem', color:C.faint }}>💬 {post.comments}</span>
              <span style={{ fontSize:'0.68rem', color:C.faint, marginLeft:'auto' }}>{post.date}</span>
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}

// ── Main App ──────────────────────────────────────────────
const TABS = [
  { id:'news',      label:'Actualités', icon:'📰' },
  { id:'instagram', label:'Instagram',  icon:'📸' },
  { id:'reddit',    label:'Reddit',     icon:'🤿' },
  { id:'science',   label:'Science',    icon:'🔬' },
]

export default function App() {
  const [tab, setTab]         = useState('news')
  const [news, setNews]       = useState([])
  const [science, setSci]     = useState([])
  const [reddit, setReddit]   = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [mktTime, setMktTime] = useState('—')
  const [error, setError]     = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  const today = new Date()
  const DAYS   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
  const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
  const dateStr = `${DAYS[today.getDay()]} ${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [contentRes, mktRes] = await Promise.all([
        fetch('/api/news'),
        fetch('/api/markets'),
      ])
      const content = await contentRes.json()
      const mkt     = await mktRes.json()
      if (content.news)    setNews(content.news)
      if (content.science) setSci(content.science)
      if (content.reddit)  setReddit(content.reddit)
      if (mkt.markets)     setMarkets(mkt.markets)
      if (mkt.updatedAt)   setMktTime(mkt.updatedAt)
      setLastRefresh(new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}))
    } catch(e) {
      setError('Erreur de chargement. Vérifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div style={{ background:C.bg, minHeight:'100vh', color:C.text, fontFamily:'system-ui,-apple-system,sans-serif', fontWeight:300 }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0;} a{color:inherit;} ::-webkit-scrollbar{display:none;}
      `}</style>

      {/* TOPBAR */}
      <div style={{ background:C.surf, borderBottom:`1px solid ${C.border}`, padding:'0 16px', height:50, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:C.gold, flexShrink:0 }} />
          <span style={{ fontFamily:'Georgia,serif', fontSize:'0.95rem', color:C.text, whiteSpace:'nowrap' }}>Specialty Coffee Daily</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {lastRefresh && <span style={{ fontSize:'0.63rem', color:C.faint }}>Mis à jour {lastRefresh}</span>}
          <button onClick={fetchAll} style={{ background:C.surf2, border:`1px solid ${C.border2}`, color:C.dim, fontSize:'0.7rem', padding:'4px 10px', borderRadius:6, cursor:'pointer', fontFamily:'inherit' }}>
            ↺
          </button>
        </div>
      </div>

      {/* MARKETS STRIP */}
      <div style={{ background:C.surf, borderBottom:`1px solid ${C.border}`, display:'flex', overflowX:'auto', padding:'0 16px' }}>
        {(markets.length ? markets : [
          {label:'Arabica · ICE',val:'—',unit:'¢/lb',chg:'—',up:true},
          {label:'Robusta · ICE',val:'—',unit:'$/t', chg:'—',up:false},
          {label:'EUR/USD',      val:'—',unit:'',    chg:'—',up:true},
          {label:'BRL/USD',      val:'—',unit:'',    chg:'—',up:true},
        ]).map((m,i)=>(
          <div key={i} style={{ padding:'8px 20px 8px 0', minWidth:130, borderRight:`1px solid ${C.border}`, flexShrink:0 }}>
            <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.12em', color:C.faint, marginBottom:3 }}>{m.label}</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:7 }}>
              <span style={{ fontSize:'0.88rem', fontWeight:500, color:C.text }}>
                {m.val}{m.unit&&<span style={{ fontSize:9, color:C.faint, marginLeft:3 }}>{m.unit}</span>}
              </span>
              {m.chg!=='—' && <span style={{ fontSize:'0.7rem', color:m.up?C.green:C.red }}>{m.up?'▲':'▼'}{m.chg}</span>}
            </div>
            {m.note && <div style={{ fontSize:8, color:C.faint, marginTop:2 }}>{m.note}</div>}
          </div>
        ))}
        <div style={{ padding:'8px 0 8px 16px', minWidth:90, flexShrink:0 }}>
          <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.12em', color:C.faint, marginBottom:3 }}>Mise à jour</div>
          <div style={{ fontSize:'0.72rem', color:C.dim }}>{mktTime}</div>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{ background:C.surf2, borderBottom:`1px solid ${C.border}`, display:'flex', padding:'0 16px', overflowX:'auto' }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background:'none', border:'none',
            borderBottom: tab===t.id?`2px solid ${C.gold}`:'2px solid transparent',
            color: tab===t.id?C.text:C.dim,
            fontSize:'0.78rem', padding:'12px 14px 10px',
            cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s', fontFamily:'inherit',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'18px 14px 60px' }}>
        {error && <ErrMsg msg={error} />}

        {/* NEWS */}
        {tab==='news' && (
          loading ? <Spinner label='Génération des actualités du jour...' /> :
          news.length ? (
            <div>
              <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.18em', color:C.faint, marginBottom:14, paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>
                Actualités du secteur — {news.length} articles · {dateStr}
              </div>
              <HeroCard item={news[0]} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
                {news.slice(1).map((item,i)=><NewsCard key={i} item={item} img={IMG[(i+1)%IMG.length]} i={i} />)}
              </div>
            </div>
          ) : <ErrMsg msg='Impossible de charger les actualités.' />
        )}

        {/* INSTAGRAM */}
        {tab==='instagram' && (
          <div>
            <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.18em', color:C.faint, marginBottom:6, paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>
              Comptes à suivre — {INSTAGRAM.length} sélectionnés · torréfacteurs, producteurs, baristas, matériel
            </div>
            <div style={{ fontSize:'0.73rem', color:C.faint, marginBottom:16, padding:'10px 12px', background:C.surf, border:`1px solid ${C.border}`, borderRadius:8 }}>
              ⚠️ L'API Instagram est fermée — comptes curatés manuellement. Les liens ouvrent directement les profils.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))', gap:12 }}>
              {INSTAGRAM.map((acc,i)=><InstaCard key={i} account={acc} i={i} />)}
            </div>
          </div>
        )}

        {/* REDDIT */}
        {tab==='reddit' && (
          loading ? <Spinner label='Chargement des posts Reddit...' /> :
          reddit.length ? (
            <div>
              <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.18em', color:C.faint, marginBottom:14, paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>
                Reddit — hot posts · r/espresso · r/Coffee · r/barista · {dateStr}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {reddit.map((post,i)=><RedditCard key={i} post={post} i={i} />)}
              </div>
            </div>
          ) : <ErrMsg msg='Impossible de charger les posts Reddit.' />
        )}

        {/* SCIENCE */}
        {tab==='science' && (
          loading ? <Spinner label="Recherche d'articles scientifiques..." /> :
          science.length ? (
            <div>
              <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.18em', color:C.faint, marginBottom:14, paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>
                Articles scientifiques — {science.length} articles · 2025–2026
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {science.map((item,i)=><SciCard key={i} item={item} img={SCI_IMG[i%SCI_IMG.length]} i={i} />)}
              </div>
            </div>
          ) : <ErrMsg msg='Impossible de charger les articles scientifiques.' />
        )}
      </div>
    </div>
  )
}
