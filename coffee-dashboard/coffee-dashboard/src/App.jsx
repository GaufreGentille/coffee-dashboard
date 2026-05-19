import { useState, useEffect, useCallback } from 'react'

// GaufreGentille brand palette
const BRAND = {
  yellow: '#fed238',
  orange: '#da5d16',
  purple: '#a06dd0',
  amber:  '#ea9524',
}

const DARK = {
  bg:      '#09090d',
  surf:    '#111318',
  surf2:   '#161820',
  surf3:   '#1c1f28',
  border:  '#222530',
  border2: '#2c3045',
  text:    '#ffffff',
  dim:     '#c8cde8',
  faint:   '#8890aa',
}

const LIGHT = {
  bg:      '#f2f3f7',
  surf:    '#ffffff',
  surf2:   '#f7f8fc',
  surf3:   '#eef0f6',
  border:  '#e2e5ee',
  border2: '#d0d4e2',
  text:    '#1a1d28',
  dim:     '#5a6080',
  faint:   '#9098b4',
}

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

const TOPIC_COLORS = {
  marche: BRAND.amber, culture: BRAND.purple, durabilite: '#7a9e78',
  competition: BRAND.orange, producteur: '#7a9e78', technique: BRAND.purple, materiel: BRAND.yellow,
}
const CAT_COLORS = {
  Torrefacteur: BRAND.amber, Cafe: BRAND.purple, Producteur: '#7a9e78',
  Barista: BRAND.orange, Competition: BRAND.orange, Materiel: BRAND.yellow,
}
const SUB_COLORS = { 'r/espresso': BRAND.amber, 'r/Coffee': BRAND.orange, 'r/barista': BRAND.purple }

const INSTAGRAM = [
  { handle:'onibuscoffee', name:'Onibus Coffee', category:'Torrefacteur', location:'Tokyo, JP', bio:'Specialty roaster Tokyo. Farm trips, seasonal lots, pourover culture.', followers:'142K', avatar:'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80', url:'https://instagram.com/onibuscoffee', posts:['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75','https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75','https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75'] },
  { handle:'squaremilecoffee', name:'Square Mile Coffee', category:'Torrefacteur', location:'Londres, UK', bio:'Award-winning London roastery. Transparency, traceability, exceptional filter and espresso.', followers:'98K', avatar:'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80', url:'https://instagram.com/squaremilecoffee', posts:['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75','https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75','https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75'] },
  { handle:'cafekitsune', name:'Cafe Kitsune', category:'Cafe', location:'Paris, FR', bio:'Le cafe specialite parisien de reference. Origines selectionnees, ambiance editoriale.', followers:'87K', avatar:'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80', url:'https://instagram.com/cafekitsune', posts:['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75','https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75'] },
  { handle:'yirgacheffecoop', name:'Yirgacheffe Cooperative', category:'Producteur', location:'Yirgacheffe, ET', bio:'Ethiopie - lots washed et naturels. Du cafeier a la tasse, tracabilite totale.', followers:'34K', avatar:'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80', url:'https://instagram.com/yirgacheffecoop', posts:['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75','https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75','https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75'] },
  { handle:'worldbaristachamp', name:'World Barista Champ.', category:'Competition', location:'Worldwide', bio:'Compte officiel WBC / WBrC / WCC - resultats, coulisses, highlights.', followers:'210K', avatar:'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80', url:'https://instagram.com/worldbaristachampionship', posts:['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75','https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75','https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75'] },
  { handle:'decentespresso', name:'Decent Espresso', category:'Materiel', location:'Hong Kong', bio:'Machine espresso DE2 - profils de pression programmables, data-driven extraction.', followers:'53K', avatar:'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80', url:'https://instagram.com/decentespresso', posts:['https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75','https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75','https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75'] },
  { handle:'mahlkoenig', name:'Mahlkonig', category:'Materiel', location:'Hamburg, DE', bio:'Moulins de reference - X68, E65S, EK43. Nouveautes 2026 et tips utilisation.', followers:'79K', avatar:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80', url:'https://instagram.com/mahlkoenig', posts:['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75','https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75'] },
]

const TABS = [
  { id:'news',      label:'Actualites' },
  { id:'instagram', label:'Instagram'  },
  { id:'reddit',    label:'Reddit'     },
  { id:'science',   label:'Science'    },
]

function Tag({ topic, lang, T }) {
  const color = TOPIC_COLORS[topic] || BRAND.amber
  return (
    <div style={{ display:'flex', gap:5, alignItems:'center', flexWrap:'wrap' }}>
      <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color, background:color+'22', border:`1px solid ${color}44`, borderRadius:4, padding:'2px 8px' }}>{topic}</span>
      {lang && <span style={{ fontSize:9, textTransform:'uppercase', color:T.faint, background:T.surf3, border:`1px solid ${T.border}`, borderRadius:3, padding:'2px 6px' }}>{lang === 'fr' ? 'FR' : 'EN'}</span>}
    </div>
  )
}

function Spinner({ label, T }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'32px 0', color:T.dim, fontSize:'0.82rem' }}>
      <div style={{ width:18, height:18, border:`2px solid ${T.border2}`, borderTopColor:BRAND.yellow, borderRadius:'50%', animation:'spin 0.7s linear infinite', flexShrink:0 }} />
      {label}
    </div>
  )
}

function ErrMsg({ msg, T }) {
  return <div style={{ color:'#c07070', fontSize:'0.78rem', padding:'16px 18px', background:T.surf, border:'1px solid #c0707033', borderRadius:8 }}>{msg}</div>
}

function HeroCard({ item, T }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:T.surf, border:`1px solid ${h ? BRAND.amber+'88' : T.border2}`, borderRadius:14, overflow:'hidden', marginBottom:12, cursor:'pointer', transition:'border-color 0.2s, box-shadow 0.2s', boxShadow: h ? `0 4px 24px ${BRAND.amber}18` : 'none' }}>
        <div style={{ height:200, backgroundImage:`url(${IMG[0]})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${T.surf}f8 0%, ${T.surf}66 45%, transparent 100%)` }} />
          <div style={{ position:'absolute', top:14, left:16 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)', borderRadius:20, padding:'4px 10px 4px 8px' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:BRAND.yellow }} />
              <span style={{ fontSize:10, fontWeight:700, color:'#fff', letterSpacing:'0.08em' }}>A LA UNE</span>
            </div>
          </div>
          <div style={{ position:'absolute', bottom:14, left:18 }}><Tag topic={item.topic} lang={item.lang} T={T} /></div>
        </div>
        <div style={{ padding:'18px 20px 22px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:BRAND.amber }}>{item.source}</span>
            <span style={{ fontSize:9, color:T.faint }}>{item.date}</span>
          </div>
          <div style={{ fontFamily:'Georgia,serif', fontSize:'1.55rem', fontWeight:700, color:T.text, lineHeight:1.35, marginBottom:10 }}>{item.title}</div>
          <div style={{ fontSize:'1rem', color:T.dim, lineHeight:1.7 }}>{item.summary}</div>
          <div style={{ marginTop:14, display:'inline-flex', alignItems:'center', gap:6, color:BRAND.purple, fontSize:'0.85rem', fontWeight:700 }}>
            Lire l article <span style={{ fontSize:'1rem' }}>→</span>
          </div>
        </div>
      </div>
    </a>
  )
}

function NewsCard({ item, img, i, T }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:T.surf, border:`1px solid ${h ? T.border2 : T.border}`, borderRadius:12, overflow:'hidden', cursor:'pointer', transform:h ? 'translateY(-3px)' : 'translateY(0)', transition:'all 0.2s', boxShadow: h ? `0 8px 24px rgba(0,0,0,0.12)` : 'none', animation:`fadeUp 0.35s ease ${i*70}ms both` }}>
        <div style={{ height:124, backgroundImage:`url(${img})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${T.surf}ee 0%, transparent 55%)` }} />
          <div style={{ position:'absolute', bottom:10, left:12 }}><Tag topic={item.topic} lang={item.lang} T={T} /></div>
        </div>
        <div style={{ padding:'12px 14px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:BRAND.amber }}>{item.source}</span>
            <span style={{ fontSize:9, color:T.faint }}>{item.date}</span>
          </div>
          <div style={{ fontSize:'1.05rem', fontWeight:700, color:T.text, lineHeight:1.4, marginBottom:6, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.title}</div>
          <div style={{ fontSize:'0.9rem', color:T.dim, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.summary}</div>
          <div style={{ marginTop:10, fontSize:'0.8rem', color:BRAND.purple, fontWeight:700 }}>Lire →</div>
        </div>
      </div>
    </a>
  )
}

function SciCard({ item, img, i, T }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:T.surf, border:`1px solid ${h ? T.border2 : T.border}`, borderRadius:12, overflow:'hidden', cursor:'pointer', display:'grid', gridTemplateColumns:'90px 1fr', animation:`fadeUp 0.35s ease ${i*80}ms both`, transition:'all 0.2s', minHeight:104, boxShadow: h ? `0 4px 16px rgba(0,0,0,0.1)` : 'none' }}>
        <div style={{ backgroundImage:`url(${img})`, backgroundSize:'cover', backgroundPosition:'center', borderRight:`1px solid ${T.border}`, position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.9rem' }}></div>
        </div>
        <div style={{ padding:'13px 15px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#7a9e78' }}>{item.field}</span>
            <span style={{ fontSize:9, color:T.faint }}>{item.date}</span>
          </div>
          <div style={{ fontSize:11, color:T.dim, marginBottom:5, fontStyle:'italic', fontWeight:500 }}>{item.journal}</div>
          <div style={{ fontSize:'1.05rem', fontWeight:700, color:T.text, lineHeight:1.38, marginBottom:6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.title}</div>
          <div style={{ fontSize:'0.92rem', color:T.dim, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.abstract}</div>
          <div style={{ marginTop:8, fontSize:'0.8rem', color:BRAND.purple, fontWeight:700 }}>Voir l article →</div>
        </div>
      </div>
    </a>
  )
}

function InstaCard({ account, i, T }) {
  const [h, setH] = useState(false)
  const catColor = CAT_COLORS[account.category] || BRAND.amber
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:T.surf, border:`1px solid ${h ? T.border2 : T.border}`, borderRadius:12, overflow:'hidden', animation:`fadeUp 0.35s ease ${i*60}ms both`, transition:'all 0.2s', boxShadow: h ? `0 6px 20px rgba(0,0,0,0.1)` : 'none' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:2, height:105 }}>
        {account.posts.map((p,pi) => <div key={pi} style={{ backgroundImage:`url(${p})`, backgroundSize:'cover', backgroundPosition:'center' }} />)}
      </div>
      <div style={{ padding:'14px 14px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', backgroundImage:`url(${account.avatar})`, backgroundSize:'cover', backgroundPosition:'center', border:`2px solid ${catColor}`, flexShrink:0 }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'1rem', fontWeight:700, color:T.text }}>@{account.handle}</div>
            <div style={{ fontSize:9, color:T.faint, marginTop:1 }}>{account.location}</div>
          </div>
          <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:catColor, background:catColor+'22', border:`1px solid ${catColor}44`, borderRadius:4, padding:'2px 7px', flexShrink:0 }}>{account.category}</span>
        </div>
        <div style={{ fontSize:'0.9rem', color:T.dim, lineHeight:1.6, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{account.bio}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:'0.72rem', color:T.faint }}>{account.followers} abonn&#233;s</span>
          <a href={account.url} target="_blank" rel="noopener noreferrer"
            style={{ background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color:'#fff', fontSize:'0.68rem', fontWeight:700, padding:'6px 13px', borderRadius:7, textDecoration:'none' }}>
            Voir le profil →
          </a>
        </div>
      </div>
    </div>
  )
}

function RedditCard({ post, i, T }) {
  const [h, setH] = useState(false)
  const subColor = SUB_COLORS[post.sub] || BRAND.amber
  return (
    <a href={post.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:T.surf, border:`1px solid ${h ? T.border2 : T.border}`, borderRadius:10, padding:'14px 16px', cursor:'pointer', transition:'all 0.18s', animation:`fadeUp 0.3s ease ${i*55}ms both`, transform:h ? 'translateX(4px)' : 'translateX(0)' }}>
        <div style={{ display:'flex', gap:12 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, minWidth:38 }}>
            <span style={{ fontSize:12, color:BRAND.orange }}>▲</span>
            <span style={{ fontSize:'0.9rem', fontWeight:700, color:T.text }}>{post.upvotes}</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7, flexWrap:'wrap' }}>
              <span style={{ fontSize:10, fontWeight:700, color:subColor, background:subColor+'22', border:`1px solid ${subColor}44`, borderRadius:4, padding:'1px 7px' }}>{post.sub}</span>
              {post.hot && <span style={{ fontSize:9, color:BRAND.orange, fontWeight:700 }}>🔥 Hot</span>}
              <span style={{ fontSize:9, background:T.surf3, border:`1px solid ${T.border}`, borderRadius:3, padding:'1px 6px', color:T.faint }}>{post.flair}</span>
            </div>
            <div style={{ fontSize:'1.08rem', fontWeight:700, color:T.text, lineHeight:1.4, marginBottom:8 }}>{post.title}</div>
            <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <span style={{ fontSize:'0.75rem', color:T.dim }}>{post.author}</span>
              <span style={{ fontSize:'0.75rem', color:T.dim }}>💬 {post.comments}</span>
              <span style={{ fontSize:'0.75rem', color:T.dim, marginLeft:'auto' }}>{post.date}</span>
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}

export default function App() {
  const [tab, setTab]         = useState('news')
  const [dark, setDark]       = useState(true)
  const [news, setNews]       = useState([])
  const [science, setSci]     = useState([])
  const [reddit, setReddit]   = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [mktTime, setMktTime] = useState('--')
  const [error, setError]     = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  const T = dark ? DARK : LIGHT

  const today = new Date()
  const DAYS   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
  const MONTHS = ['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre']
  const dateStr = `${DAYS[today.getDay()]} ${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [contentRes, mktRes] = await Promise.all([
        fetch('/.netlify/functions/get-news'),
        fetch('/.netlify/functions/get-markets'),
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
      setError('Erreur de chargement. Verifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div style={{ background:T.bg, minHeight:'100vh', color:T.text, fontFamily:"Inter,-apple-system,system-ui,sans-serif", fontWeight:500, fontSize:17, transition:'background 0.3s, color 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0;} a{color:inherit;} ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:${T.border2};border-radius:3px;}
      `}</style>

      {/* TOPBAR */}
      <div style={{ background:T.surf, borderBottom:`1px solid ${T.border}`, padding:'0 20px', height:54, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(12px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <img src="/logo.png" alt="Kissa Soko" style={{ height:36, width:'auto', display:'block' }} />
            <div style={{ fontSize:11, color:T.dim, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:500 }}>by GaufreGentille · Actu Cafe</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'0.63rem', color:T.faint }}>{dateStr}</span>
          {lastRefresh && <span style={{ fontSize:'0.62rem', color:T.faint, display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#7a9e78', display:'inline-block' }} />{lastRefresh}
          </span>}
          <button onClick={fetchAll} style={{ background:T.surf2, border:`1px solid ${T.border2}`, color:T.dim, fontSize:'0.72rem', padding:'5px 11px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
            ↺
          </button>
          {/* Dark/Light toggle */}
          <button onClick={()=>setDark(!dark)} style={{ background: dark ? BRAND.yellow+'22' : BRAND.purple+'22', border:`1px solid ${dark ? BRAND.yellow+'44' : BRAND.purple+'44'}`, color: dark ? BRAND.yellow : BRAND.purple, fontSize:'0.72rem', padding:'5px 11px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontWeight:600, transition:'all 0.2s' }}>
            {dark ? '☀ Clair' : '☾ Sombre'}
          </button>
        </div>
      </div>

      {/* MARKETS STRIP */}
      <div style={{ background:T.surf, borderBottom:`2px solid ${BRAND.yellow}22`, display:'flex', overflowX:'auto', padding:'0 24px', minHeight:64 }}>
        {(markets.length ? markets : [
          {label:'Arabica ICE',val:'--',unit:'c/lb',chg:'',up:true},
          {label:'Robusta ICE',val:'--',unit:'$/t', chg:'',up:false},
          {label:'EUR/USD',    val:'--',unit:'',    chg:'',up:true},
          {label:'BRL/USD',   val:'--',unit:'',    chg:'',up:true},
        ]).map((m,i) => (
          <div key={i} style={{ padding:'9px 24px 9px 0', minWidth:140, borderRight:`1px solid ${T.border}`, flexShrink:0 }}>
            <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:T.dim, marginBottom:5, fontWeight:600 }}>{m.label}</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:7 }}>
              <span style={{ fontSize:'1.25rem', fontWeight:700, color:T.text }}>
                {m.val}{m.unit && <span style={{ fontSize:9, color:T.faint, marginLeft:3 }}>{m.unit}</span>}
              </span>
              {m.chg && <span style={{ fontSize:'0.85rem', color:m.up ? '#7cb87c' : '#c07070', fontWeight:700 }}>{m.up ? '▲' : '▼'}{m.chg}</span>}
            </div>
            {m.note && <div style={{ fontSize:8, color:T.faint, marginTop:2 }}>{m.note}</div>}
          </div>
        ))}
        <div style={{ padding:'9px 0 9px 20px', minWidth:80, flexShrink:0 }}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:T.dim, marginBottom:5, fontWeight:600 }}>Mis a jour</div>
          <div style={{ fontSize:'1.1rem', color:T.text, fontWeight:700 }}>{mktTime}</div>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{ background:T.surf2, borderBottom:`1px solid ${T.border}`, display:'flex', padding:'0 20px', overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background:'none', border:'none',
            borderBottom: tab===t.id ? `3px solid ${BRAND.yellow}` : '3px solid transparent',
            color: tab===t.id ? T.text : T.dim,
            fontWeight: tab===t.id ? 600 : 400,
            fontSize:'0.95rem', padding:'14px 20px 11px', letterSpacing:'0.02em',
            cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s', fontFamily:'inherit',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth:960, margin:'0 auto', padding:'20px 16px 80px' }}>
        {error && <ErrMsg msg={error} T={T} />}

        {/* NEWS */}
        {tab==='news' && (
          loading ? <Spinner label="Generation des actualites du jour..." T={T} /> :
          news.length ? (
            <div>
              <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.18em', color:T.faint, marginBottom:16, paddingBottom:10, borderBottom:`1px solid ${T.border}` }}>
                Actualites du secteur - {news.length} articles · {dateStr}
              </div>
              <HeroCard item={news[0]} T={T} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(225px,1fr))', gap:12 }}>
                {news.slice(1).map((item,i) => <NewsCard key={i} item={item} img={IMG[(i+1)%IMG.length]} i={i} T={T} />)}
              </div>
            </div>
          ) : <ErrMsg msg="Impossible de charger les actualites." T={T} />
        )}

        {/* INSTAGRAM */}
        {tab==='instagram' && (
          <div>
            <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.15em', color:T.dim, fontWeight:600, marginBottom:10, paddingBottom:12, borderBottom:`1px solid ${T.border}` }}>
              Comptes a suivre - {INSTAGRAM.length} selectionnes · torrefacteurs, producteurs, baristas, materiel
            </div>
            <div style={{ fontSize:'0.73rem', color:T.faint, marginBottom:16, padding:'10px 14px', background:T.surf, border:`1px solid ${T.border}`, borderRadius:8, display:'flex', alignItems:'center', gap:8 }}>
              <span>⚠️</span> API Instagram fermee - comptes curates manuellement. Les liens ouvrent les vrais profils.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))', gap:12 }}>
              {INSTAGRAM.map((acc,i) => <InstaCard key={i} account={acc} i={i} T={T} />)}
            </div>
          </div>
        )}

        {/* REDDIT */}
        {tab==='reddit' && (
          loading ? <Spinner label="Chargement des posts Reddit..." T={T} /> :
          reddit.length ? (
            <div>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.15em', color:T.dim, fontWeight:600, marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${T.border}` }}>
                Reddit - hot posts · r/espresso · r/Coffee · r/barista · {dateStr}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {reddit.map((post,i) => <RedditCard key={i} post={post} i={i} T={T} />)}
              </div>
            </div>
          ) : <ErrMsg msg="Impossible de charger les posts Reddit." T={T} />
        )}

        {/* SCIENCE */}
        {tab==='science' && (
          loading ? <Spinner label="Recherche d articles scientifiques..." T={T} /> :
          science.length ? (
            <div>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.15em', color:T.dim, fontWeight:600, marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${T.border}` }}>
                Articles scientifiques - {science.length} articles · 2025-2026
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {science.map((item,i) => <SciCard key={i} item={item} img={SCI_IMG[i%SCI_IMG.length]} i={i} T={T} />)}
              </div>
            </div>
          ) : <ErrMsg msg="Impossible de charger les articles scientifiques." T={T} />
        )}
      </div>
    </div>
  )
}
