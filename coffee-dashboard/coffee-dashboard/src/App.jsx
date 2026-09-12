import { useState, useEffect, useCallback, useRef } from 'react'
import HarvestPanel from './components/HarvestPanel'
import InstaVeillePanel from './components/InstaVeillePanel'
import HomePage from './HomePage'
import SiteMenu from './components/SiteMenu'
import { ORIGIN_COUNTRIES } from './data/origins'
import './kissa.css'
import './kissa-menu.css'

// GaufreGentille brand palette
const BRAND = {
  yellow: '#fed238',
  orange: '#da5d16',
  purple: '#a06dd0',
  amber:  '#ea9524',
}

const THEME = {
  bg: '#f4ede3',
  surf: '#f7f1e8',
  surf2: '#efe6da',
  surf3: '#e8ddd0',
  border: 'rgba(7,23,43,.12)',
  border2: 'rgba(7,23,43,.22)',
  text: '#07172b',
  dim: '#46515d',
  faint: '#7d817f',
}

const TOPIC_COLORS = {
  marche: BRAND.amber, culture: BRAND.purple, durabilite: '#7a9e78',
  competition: BRAND.orange, producteur: '#7a9e78', technique: BRAND.purple, materiel: BRAND.yellow,
}

const PLAYLISTS = [
  {
    name: 'Midnight Cassette',
    url: 'https://suno.com/playlist/6400cd5b-e7a3-4d8a-8c5b-a5c07bb02ecd',
    tracks: 26,
    cover: '/playlist-midnight.jpg',
    vibe: 'City pop · J-pop · Late night drives',
  },
  {
    name: 'Kagemusha',
    url: 'https://suno.com/playlist/a1394680-db07-46e7-b7cd-60f42412989c',
    tracks: 18,
    cover: '/playlist-kagemusha.jpg',
    vibe: 'Tokyo nights · Neon · Electronic',
  },
  {
    name: 'Kowareta Kagami',
    url: 'https://suno.com/playlist/b6243889-9e57-46cb-90ae-fad1f0adb8a0',
    tracks: '—',
    cover: '/playlist-sakura.jpg',
    vibe: 'Ambient · Cinematic · Japan',
  },
]

// Source unique de la navigation. L'en-tete d'accueil, l'en-tete des pages
// interieures et l'index des univers lisent tous cette liste : un libelle
// se change ici, et il se change partout.
//   nav   : apparait dans les deux barres de navigation
//   tile  : entre dans l'index des univers en bas de l'accueil
//   goTo  : onglet reellement ouvert, quand il differe de l'id
//   href  : lien externe, l'entree sort du site
//   music : ouvre le panneau musique au lieu d'un onglet
const TABS = [
  { id:'home',      label:'Accueil',    nav:false },
  { id:'news',      label:'Actualités', nav:true  },
  { id:'science',   label:'Science',    nav:true  },
  { id:'harvest',   label:'Origines',   nav:true  },
  { id:'gear',      label:'Matériel',   nav:true  },
  { id:'reddit',    label:'Communauté', nav:true  },
  { id:'instagram', label:'Instagram',  nav:true  },
  // Marche n'est pas une page : le bandeau des cours est visible partout.
  // Ces trois entrees sortent de la barre de navigation mais vivent dans
  // le menu, ou elles ouvrent les actualites, le panneau musique ou le jeu.
  { id:'market',    label:'Marché',     nav:false, goTo:'news' },
  { id:'music',     label:'Musique',    nav:false, music:true },
  { id:'game',      label:'Jeu',        nav:false, href:'https://kissasoko.netlify.app/hangar-torref-843/' },
]

const NAV_TABS = TABS.filter(t => t.nav)

const MARKET_PLACEHOLDER = [
  { label:'Arabica ICE', val:'--', unit:'c/lb', chg:'', up:true  },
  { label:'Robusta ICE', val:'--', unit:'$/t',  chg:'', up:false },
  { label:'EUR/USD',     val:'--', unit:'',     chg:'', up:true  },
  { label:'BRL/USD',     val:'--', unit:'',     chg:'', up:true  },
]

const PAGE_ART = {
  news:      { src:'/kissa-hero-botanical.png',    side:'right', variant:'is-news' },
  science:   { src:'/kissa-bottom-botanical.png',  side:'left',  variant:'is-science' },
  harvest:   { src:'/kissa-hero-botanical.png',    side:'right', variant:'is-harvest' },
  gear:      { src:'/kissa-bottom-botanical.png',  side:'left',  variant:'is-gear' },
  reddit:    { src:'/kissa-hero-botanical.png',    side:'right', variant:'is-reddit' },
  instagram: { src:'/kissa-bottom-botanical.png',  side:'left',  variant:'is-instagram' },
}

/* ---------- Chargement des flux ---------- */

const pickNews    = j => j.news || []
const pickScience = j => j.science || []
const pickGear    = j => j.gear || []
const pickSprudge = j => j.tiles || []
const pickHarvest = j => (j.origins ? j : null)
const pickMarkets = j => ({ rows: j.markets || [], updatedAt: j.updatedAt || '--' })

// Charge une function Netlify a la premiere ouverture de l'univers concerne,
// puis garde le resultat en memoire. Un echec remet le drapeau a zero pour
// qu'un retour sur l'onglet retente le chargement.
function useFeed(url, pick, active) {
  const [state, setState] = useState({ data: null, loading: false, error: null })
  const loaded = useRef(false)

  const load = useCallback(async () => {
    loaded.current = true
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setState({ data: pick(await res.json()), loading: false, error: null })
    } catch (e) {
      console.error(`Fetch ${url}:`, e)
      loaded.current = false
      setState({ data: null, loading: false, error: 'Chargement impossible. Réessaie dans un instant.' })
    }
  }, [url, pick])

  useEffect(() => { if (active && !loaded.current) load() }, [active, load])

  return { ...state, reload: load }
}

/* ---------- Accueil ---------- */

function GGCursor() {
  const cursorRef = useRef(null)
  const dotRef = useRef(null)
  const [active, setActive] = useState(false)
  const [fine, setFine] = useState(() => window.matchMedia('(pointer: fine)').matches)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const onChange = e => setFine(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!fine) return
    let tx = innerWidth/2, ty = innerHeight/2, x=tx, y=ty, raf
    const move = e => { tx=e.clientX; ty=e.clientY }
    const over = e => setActive(Boolean(e.target.closest('a,button,[data-cursor="active"]')))
    const tick = () => {
      x += (tx-x)*.16; y += (ty-y)*.16
      if(cursorRef.current) cursorRef.current.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`
      if(dotRef.current) dotRef.current.style.transform=`translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`
      raf=requestAnimationFrame(tick)
    }
    addEventListener('pointermove',move,{passive:true})
    addEventListener('pointerover',over,{passive:true})
    tick()
    return ()=>{ removeEventListener('pointermove',move); removeEventListener('pointerover',over); cancelAnimationFrame(raf) }
  },[fine])

  if (!fine) return null

  return <>
    <div ref={cursorRef} className={`ggc-cursor ${active?'is-active':''}`} />
    <div ref={dotRef} className="ggc-cursor-dot" />
  </>
}

/* ---------- Briques d'interface ---------- */

function Tag({ topic, lang }) {
  const color = TOPIC_COLORS[topic] || BRAND.orange
  if (!topic && !lang) return null
  return (
    <div className="ks-tags">
      {topic && <span className="ks-topic" style={{'--tag-color':color}}>{topic}</span>}
      {lang && <span className="ks-lang">{lang === 'fr' ? 'FR' : 'EN'}</span>}
    </div>
  )
}

function Spinner({ label }) {
  return (
    <div className="ks-spinner">
      <span />
      {label}
    </div>
  )
}

function ErrMsg({ msg }) {
  return <div className="ks-error">{msg}</div>
}

function getContentImage(item) {
  return item?.image || item?.img || item?.imageUrl || item?.thumbnail || null
}

function PageIntro({ title, meta, deck }) {
  return (
    <header className="ks-page-intro">
      <div>
        {meta && <p className="ks-page-meta">{meta}</p>}
        <h1>{title}<span>.</span></h1>
      </div>
      {deck && <p className="ks-page-deck">{deck}</p>}
    </header>
  )
}


function PageOrnament({ page }) {
  const art = PAGE_ART[page]
  if (!art) return null
  return (
    <div className={`ks-page-ornament ${art.side} ${art.variant}`} aria-hidden="true">
      <img src={art.src} alt="" />
    </div>
  )
}

function NewsLead({ item }) {
  const image = getContentImage(item)
  return (
    <article className={`ks-news-lead ${image ? 'has-image' : 'no-image'}`}>
      {image && (
        <a className="ks-news-lead-media" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.title}>
          <img src={image} alt="" />
        </a>
      )}
      <div className="ks-news-lead-copy">
        <div className="ks-news-meta-row">
          <Tag topic={item.topic} lang={item.lang} />
          <span>{item.source}</span>
          <span>{item.date}</span>
        </div>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="ks-news-lead-title">
          {item.title}
        </a>
        {item.summary && <p>{item.summary}</p>}
        <a className="ks-read-link" href={item.url} target="_blank" rel="noopener noreferrer">Lire l'article <b>→</b></a>
      </div>
    </article>
  )
}

function NewsCard({ item }) {
  const image = getContentImage(item)
  return (
    <article className={`ks-news-card ${image ? 'has-image' : 'no-image'}`}>
      {image && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="ks-news-card-media" aria-label={item.title}>
          <img src={image} alt="" loading="lazy" />
        </a>
      )}
      <div className="ks-news-card-body">
        <div className="ks-news-meta-row">
          <Tag topic={item.topic} lang={item.lang} />
          <span>{item.source}</span>
          <span>{item.date}</span>
        </div>
        <a className="ks-news-card-title" href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
        {item.summary && <p>{item.summary}</p>}
        <a className="ks-read-link" href={item.url} target="_blank" rel="noopener noreferrer">Lire <b>→</b></a>
      </div>
    </article>
  )
}

function NewsPage({ items, dateStr }) {
  const [lead, ...rest] = items
  return (
    <section className="ks-editorial-page ks-news-page ks-page-has-art">
      <PageOrnament page="news" />
      <PageIntro
        title="Actualités"
        meta={`${items.length} articles · ${dateStr}`}
        deck="Le café bouge vite. Ici, on garde les signaux qui méritent vraiment qu'on s'y attarde."
      />
      <NewsLead item={lead} />
      {rest.length > 0 && (
        <div className="ks-news-grid">
          {rest.map(item => <NewsCard key={item.url || item.title} item={item} />)}
        </div>
      )}
    </section>
  )
}

function SciCard({ item, i, T }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:T.surf, border:`1px solid ${h ? T.border2 : T.border}`, borderRadius:12, overflow:'hidden', cursor:'pointer', animation:`fadeUp 0.35s ease ${i*80}ms both`, transition:'all 0.2s', minHeight:104, boxShadow: h ? `0 4px 16px rgba(0,0,0,0.08)` : 'none' }}>
        <div style={{ padding:'18px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#627e62' }}>{item.field}</span>
            <span style={{ fontSize:9, color:T.faint }}>{item.date}</span>
          </div>
          <div style={{ fontSize:11, color:T.dim, marginBottom:6, fontStyle:'italic', fontWeight:500 }}>{item.journal}</div>
          <div style={{ fontSize:'1.05rem', fontWeight:700, color:T.text, lineHeight:1.38, marginBottom:7 }}>{item.title}</div>
          <div style={{ fontSize:'0.92rem', color:T.dim, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.abstract}</div>
          <div style={{ marginTop:10, fontSize:'0.8rem', color:BRAND.orange, fontWeight:700 }}>Voir l'article →</div>
        </div>
      </div>
    </a>
  )
}

function RedditCard({ post, i, T }) {
  const [h, setH] = useState(false)

  // Article communaute (Sprudge) : texte complet affiche sur place, sans lien sortant
  const isSprudge = post.source === 'The Sprudge Report'

  const card = (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background:T.surf, border:`1px solid ${h ? BRAND.amber+'66' : T.border}`,
        borderRadius:12, overflow:'hidden',
        cursor: isSprudge ? 'default' : 'pointer',
        transition:'all 0.18s', animation:`fadeUp 0.3s ease ${i*55}ms both`,
        transform: (!isSprudge && h) ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: (!isSprudge && h) ? `0 8px 24px rgba(0,0,0,0.15)` : 'none',
        display:'flex', flexDirection:'column',
      }}>
      {post.img && (
        <div style={{
          height:160, flexShrink:0,
          backgroundImage:`url(${post.img})`,
          backgroundSize:'cover', backgroundPosition:'center',
          position:'relative',
        }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />
        </div>
      )}
      <div style={{ padding:'16px 18px 18px', flex:1, display:'flex', flexDirection:'column', gap:8 }}>
        {post.date && (
          <div style={{ fontSize:10, color:T.faint, letterSpacing:'0.05em' }}>{post.date}</div>
        )}
        <div style={{ fontSize:'0.95rem', fontWeight:700, color:T.text, lineHeight:1.4 }}>
          {post.title}
        </div>
        {post.summary && (
          <div style={{ fontSize:'0.82rem', color:T.dim, lineHeight:1.7, flex:1 }}>
            {post.summary}
          </div>
        )}
        {!isSprudge && post.url && (
          <a href={post.url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize:'0.72rem', fontWeight:700, color:BRAND.amber, textDecoration:'none', marginTop:4, alignSelf:'flex-end' }}>
            Lire plus →
          </a>
        )}
      </div>
    </div>
  )

  return isSprudge
    ? card
    : <a href={post.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>{card}</a>
}

function GearHeroCard({ item, T }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:T.surf, border:`1px solid ${h?BRAND.amber+'88':T.border2}`, borderRadius:14, overflow:'hidden', marginBottom:12, cursor:'pointer', transition:'all 0.2s', boxShadow:h?`0 4px 24px ${BRAND.amber}18`:'none' }}>
        <div style={{ height:220, backgroundImage:`url(${item.img})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${T.surf}f0 0%, ${T.surf}44 50%, transparent 100%)` }} />
          <div style={{ position:'absolute', top:14, left:16, display:'flex', gap:8, alignItems:'center' }}>
            {item.hot && <span style={{ fontSize:'1.1rem' }}>🔥</span>}
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', background:T.surf+'cc', backdropFilter:'blur(8px)', color:BRAND.amber, border:`1px solid ${BRAND.amber}44`, borderRadius:5, padding:'3px 9px' }}>{item.category}</span>
          </div>
          <div style={{ position:'absolute', bottom:16, left:18, right:18 }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:BRAND.amber, marginBottom:6 }}>{item.brand}</div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'1.25rem', fontWeight:700, color:'#fff', lineHeight:1.3, textShadow:'0 1px 8px rgba(0,0,0,0.6)' }}>{item.name}</div>
          </div>
        </div>
        <div style={{ padding:'16px 18px 20px' }}>
          <div style={{ fontSize:'0.9rem', color:T.dim, lineHeight:1.7, marginBottom:12, display:'-webkit-box', WebkitLineClamp:5, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.description || item.summary}</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            {item.price && <span style={{ fontSize:'1rem', fontWeight:700, color:BRAND.yellow }}>{item.price}</span>}
            {item.source && <span style={{ fontSize:'0.7rem', color:T.faint }}>{item.source} · {item.date}</span>}
            <span style={{ fontSize:'0.72rem', color:BRAND.purple, fontWeight:600 }}>Voir →</span>
          </div>
        </div>
      </div>
    </a>
  )
}

function GearCard({ item, i, T }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:T.surf, border:`1px solid ${h?T.border2:T.border}`, borderRadius:12, overflow:'hidden', cursor:'pointer', transform:h?'translateY(-3px)':'translateY(0)', transition:'all 0.2s', boxShadow:h?`0 8px 24px rgba(0,0,0,0.12)`:'none', animation:`fadeUp 0.35s ease ${i*60}ms both` }}>
        <div style={{ height:160, backgroundImage:`url(${item.img})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${T.surf}ee 0%, transparent 50%)` }} />
          {item.hot && (
            <div style={{ position:'absolute', top:10, left:12, display:'flex', gap:6, alignItems:'center' }}>
              <span style={{ fontSize:'1rem' }}>🔥</span>
            </div>
          )}
          <div style={{ position:'absolute', bottom:10, left:12 }}>
            <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:BRAND.amber, background:T.surf+'dd', borderRadius:4, padding:'2px 7px' }}>{item.category}</span>
          </div>
        </div>
        <div style={{ padding:'13px 15px 16px' }}>
          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:BRAND.amber, marginBottom:5 }}>{item.brand}</div>
          <div style={{ fontSize:'0.95rem', fontWeight:700, color:T.text, lineHeight:1.35, marginBottom:7, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.name}</div>
          <div style={{ fontSize:'0.78rem', color:T.dim, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.description || item.summary}</div>
          <div style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            {item.price && <span style={{ fontSize:'0.88rem', fontWeight:700, color:BRAND.yellow }}>{item.price}</span>}
            {item.source && !item.price && <span style={{ fontSize:'0.68rem', color:T.faint }}>{item.source}</span>}
            <span style={{ fontSize:'0.7rem', color:BRAND.purple, fontWeight:600 }}>Voir →</span>
          </div>
        </div>
      </div>
    </a>
  )
}


const ORIGIN_MAP_POINTS = {
  "burundi": {
    "lat": -3.37,
    "lon": 29.92
  },
  "cameroun": {
    "lat": 5.69,
    "lon": 12.74
  },
  "congo-rd": {
    "lat": -2.88,
    "lon": 23.66
  },
  "cote-d-ivoire": {
    "lat": 7.54,
    "lon": -5.55
  },
  "ethiopie": {
    "lat": 9.15,
    "lon": 40.49
  },
  "kenya": {
    "lat": 0.17,
    "lon": 37.91
  },
  "madagascar": {
    "lat": -18.77,
    "lon": 46.87
  },
  "ouganda": {
    "lat": 1.37,
    "lon": 32.29
  },
  "rwanda": {
    "lat": -1.94,
    "lon": 29.87
  },
  "tanzanie": {
    "lat": -6.37,
    "lon": 34.89
  },
  "malawi": {
    "lat": -13.25,
    "lon": 34.3
  },
  "zambie": {
    "lat": -13.13,
    "lon": 27.85
  },
  "zimbabwe": {
    "lat": -19.02,
    "lon": 29.15
  },
  "costa-rica": {
    "lat": 9.75,
    "lon": -83.75
  },
  "guatemala": {
    "lat": 15.78,
    "lon": -90.23
  },
  "honduras": {
    "lat": 14.82,
    "lon": -86.24
  },
  "mexique": {
    "lat": 17.1,
    "lon": -96.2
  },
  "nicaragua": {
    "lat": 12.87,
    "lon": -85.21
  },
  "haiti": {
    "lat": 18.97,
    "lon": -72.29
  },
  "porto-rico": {
    "lat": 18.22,
    "lon": -66.59
  },
  "republique-dominicaine": {
    "lat": 18.74,
    "lon": -70.16
  },
  "bolivie": {
    "lat": -16.29,
    "lon": -63.59
  },
  "bresil": {
    "lat": -14.24,
    "lon": -51.93
  },
  "colombie": {
    "lat": 4.57,
    "lon": -74.3
  },
  "equateur": {
    "lat": -1.83,
    "lon": -78.18
  },
  "perou": {
    "lat": -9.19,
    "lon": -75.02
  },
  "chine": {
    "lat": 24.5,
    "lon": 101.3
  },
  "inde": {
    "lat": 15.32,
    "lon": 75.71
  },
  "indonesie": {
    "lat": -2.2,
    "lon": 117.3
  },
  "vietnam": {
    "lat": 15.9,
    "lon": 107.8
  },
  "australie": {
    "lat": -17.3,
    "lon": 145.7
  },
  "nouvelle-guinee-papouasie": {
    "lat": -6.3,
    "lon": 145.4
  }
}

const WORLD_MAP_PATH = "M0.0,35.1 16.8,44.1 14.9,41.2 28.7,44.2 19.4,45.5 21.9,47.6 19.0,50.2 4.3,43.4 0.0,47.5 0.0,35.1Z M1000.0,47.5 986.5,48.7 995.1,49.6 997.6,56.4 982.0,58.1 973.1,63.9 954.5,63.7 949.7,70.1 953.7,70.9 953.8,75.8 935.2,92.8 933.3,74.3 959.2,55.8 945.0,61.9 945.5,57.5 935.2,58.9 928.4,64.1 931.1,66.3 895.7,66.2 875.6,79.9 892.8,85.1 890.0,98.8 875.4,116.3 866.0,116.8 854.2,128.2 859.5,136.8 858.6,143.2 851.5,145.6 850.8,144.6 851.4,134.5 846.3,133.4 848.8,128.5 836.5,131.5 838.6,124.1 827.0,130.3 831.1,136.5 840.8,135.7 831.1,143.3 838.6,153.7 833.5,153.0 838.6,156.3 833.7,158.6 838.8,161.7 823.6,181.7 814.9,181.2 806.3,190.3 804.5,185.5 796.1,187.8 793.4,194.6 802.6,206.3 802.8,218.6 791.1,226.8 791.9,222.9 777.6,212.4 775.6,225.3 786.5,237.8 789.7,250.5 781.4,245.7 773.0,228.7 771.5,202.1 769.1,199.0 761.8,204.0 761.4,193.1 754.0,182.3 744.5,184.0 723.0,204.9 721.9,222.0 715.4,229.1 704.0,203.7 702.5,183.9 696.7,188.9 691.5,183.8 695.7,181.7 684.6,173.2 671.5,175.2 659.2,172.7 657.4,168.2 649.2,169.8 635.9,158.0 632.5,161.3 641.0,176.1 643.3,172.3 642.5,177.4 650.3,178.0 657.0,170.9 657.3,176.8 666.1,184.0 652.8,200.7 620.7,214.4 618.6,201.5 596.0,165.3 597.2,160.8 595.1,166.5 590.5,159.5 589.7,155.4 595.1,155.0 600.0,144.8 600.4,137.5 576.1,138.0 578.7,136.8 572.4,129.1 592.6,121.0 615.0,123.0 615.1,118.7 601.7,110.9 609.1,104.3 597.7,106.6 595.7,108.6 597.1,110.3 601.8,110.3 594.4,113.4 590.2,110.2 593.3,107.8 583.7,107.1 575.9,119.8 580.5,124.2 562.7,125.9 562.6,131.0 566.9,133.3 563.1,135.2 564.4,138.8 560.3,137.6 559.4,133.1 564.5,133.3 558.6,132.7 554.4,121.6 537.6,109.0 534.4,114.0 551.4,127.0 546.9,126.0 544.6,134.0 543.5,127.3 524.3,113.3 509.3,116.9 494.1,137.8 484.4,140.1 475.0,136.9 473.6,131.3 474.2,117.7 495.5,116.5 496.9,107.3 486.7,100.3 496.2,99.9 494.6,96.4 500.0,97.7 516.3,84.7 527.3,84.3 523.0,80.4 523.9,72.9 529.6,70.9 526.2,80.2 530.2,82.9 553.8,82.1 559.0,79.8 560.3,71.5 567.8,72.5 565.3,66.2 584.3,63.9 559.5,61.8 558.7,54.8 570.9,47.7 562.9,44.9 549.1,54.1 547.7,61.5 553.0,64.5 545.0,68.0 544.0,76.2 535.6,78.4 529.9,64.0 522.8,69.7 515.7,68.3 518.3,65.1 514.5,65.2 519.8,62.1 515.4,64.1 514.0,60.4 519.8,61.0 521.4,59.8 514.5,60.2 519.0,57.7 514.2,56.7 530.4,52.7 526.4,52.1 550.4,33.6 568.4,28.7 615.0,41.0 608.6,44.3 588.5,41.0 603.9,51.7 602.4,47.3 612.4,49.3 610.3,46.3 613.2,44.6 622.5,44.7 620.2,36.1 629.3,37.8 624.8,40.1 627.8,42.0 649.6,35.2 647.8,37.6 666.0,37.1 669.0,32.3 689.6,37.8 692.4,35.2 685.6,33.3 685.4,28.3 699.0,22.6 702.4,23.3 699.5,27.2 704.5,36.9 692.0,42.6 700.4,44.0 707.4,35.8 712.7,35.1 714.2,39.0 718.8,39.9 715.7,35.4 710.9,34.2 704.9,34.5 706.5,30.0 702.8,27.4 707.9,22.8 711.5,28.2 718.1,29.0 711.0,25.8 717.9,24.3 731.3,26.4 727.8,30.1 732.3,32.8 732.4,26.6 723.6,20.5 777.3,12.6 774.7,11.2 789.3,7.3 816.5,13.3 812.1,13.3 815.5,15.2 797.3,20.3 793.1,23.1 808.4,20.1 805.6,19.1 841.2,22.8 845.7,19.7 857.8,21.7 859.9,24.8 856.4,25.2 864.0,29.6 868.8,25.6 889.2,27.3 886.5,24.7 891.4,22.7 941.5,29.0 947.5,34.5 989.1,32.2 1000.0,35.1 1000.0,47.5Z M588.7,154.4 603.9,194.7 620.4,215.1 618.1,218.1 623.8,221.8 641.1,216.6 642.8,221.6 633.2,240.6 608.9,269.7 613.5,302.1 596.2,317.4 598.6,331.6 590.3,337.5 590.0,345.7 575.0,361.7 555.6,365.8 551.1,364.1 532.8,312.1 538.5,289.9 535.2,274.0 524.2,256.9 527.7,254.3 527.0,241.8 516.6,241.1 510.6,233.7 494.5,239.7 475.8,239.5 465.2,231.3 458.5,216.6 453.4,215.3 456.7,211.8 451.3,207.9 455.4,198.3 452.8,185.4 484.8,140.4 494.6,143.1 527.1,135.8 530.7,136.7 528.4,147.2 552.7,158.4 560.3,149.9 580.7,156.6 588.7,154.4Z M267.0,218.8 279.0,226.3 276.6,231.8 262.0,223.3 257.2,212.1 212.5,196.5 206.9,191.0 205.6,181.9 180.7,153.3 195.9,180.9 188.4,175.8 173.8,148.9 164.9,144.7 156.3,130.8 154.0,118.4 157.1,107.5 153.5,100.7 159.0,101.5 158.6,105.0 159.7,99.5 153.3,92.6 145.0,91.9 147.2,87.1 143.3,88.3 144.1,84.4 137.5,81.7 139.8,79.7 139.1,76.6 136.5,80.4 136.0,76.1 132.8,77.8 134.7,75.7 124.0,65.4 124.7,69.3 119.3,66.7 120.3,69.4 112.5,63.5 93.6,60.1 78.5,66.4 79.4,61.4 85.7,58.9 81.7,59.4 71.8,65.7 74.3,67.4 56.7,77.8 46.2,80.2 62.8,71.7 64.3,66.8 49.6,68.1 49.5,63.2 44.1,64.2 46.1,61.4 38.5,58.9 53.4,48.7 33.0,45.6 55.0,43.1 36.5,37.1 65.3,27.4 124.2,36.2 122.2,34.4 144.3,30.0 183.6,37.0 180.3,38.9 194.3,38.2 202.2,43.5 199.9,38.9 206.3,36.3 197.7,37.4 205.0,35.2 216.1,39.3 233.7,37.3 235.3,40.9 240.7,33.8 231.7,29.2 237.5,25.5 249.3,37.6 254.9,35.3 256.9,41.1 264.7,35.9 262.4,32.3 270.7,32.8 274.5,40.0 268.5,43.5 247.4,44.8 258.6,47.3 248.2,52.7 239.4,50.3 248.3,53.6 239.9,57.5 236.2,66.7 241.2,67.7 242.2,73.5 271.3,79.1 271.3,86.2 278.5,91.9 282.2,88.4 278.4,80.8 287.4,75.2 281.7,67.9 285.6,63.6 282.8,56.5 306.9,60.3 303.1,63.6 309.2,70.1 316.7,69.2 318.0,64.5 321.2,62.9 331.4,79.7 340.7,81.0 331.2,85.2 338.4,82.1 345.3,88.9 333.6,94.7 315.4,94.7 305.6,101.1 302.2,105.7 320.5,98.4 314.5,102.0 330.7,110.5 318.1,116.4 316.4,113.1 324.0,110.3 308.8,112.5 302.6,119.9 305.7,122.2 295.6,124.1 292.0,130.8 290.2,128.3 291.5,132.5 289.0,136.6 289.2,128.9 288.0,133.7 285.5,131.7 286.1,136.2 288.9,137.2 290.2,140.9 289.0,137.9 288.0,143.7 273.3,155.4 277.7,169.4 276.2,175.3 267.5,159.5 255.6,156.8 248.9,158.6 252.1,159.6 251.6,162.7 236.1,160.2 228.4,167.9 228.1,182.8 233.7,195.2 245.7,196.1 249.2,187.8 258.9,186.8 253.0,204.2 268.4,206.2 267.0,218.8Z M296.2,423.6 298.7,419.8 294.6,419.3 292.6,407.7 296.6,407.8 289.9,403.7 295.5,403.1 298.5,396.6 295.3,373.7 301.1,361.9 304.7,313.5 289.1,301.5 274.3,268.4 278.6,263.1 275.3,262.2 277.5,252.3 286.0,242.3 283.2,228.0 278.0,225.0 286.7,229.6 290.9,220.4 300.9,215.1 300.8,226.0 305.5,215.9 310.8,221.4 328.1,220.6 325.3,221.8 337.0,234.5 357.5,241.3 361.4,251.0 353.6,259.9 358.7,257.7 362.0,263.3 366.5,256.9 371.7,257.6 375.5,259.3 375.5,265.5 388.8,263.9 401.1,271.1 403.3,277.6 392.1,295.7 386.2,324.9 364.6,335.6 364.5,345.7 355.3,357.3 359.5,351.8 357.5,350.4 349.6,365.2 339.3,364.6 337.7,360.2 337.3,364.4 342.4,370.5 340.1,376.2 326.8,378.3 326.7,385.1 319.4,384.5 323.4,390.6 312.1,401.5 317.3,407.4 309.1,413.3 306.7,419.2 310.1,421.5 302.0,426.5 298.7,424.9 301.3,422.3 296.2,423.6Z M906.2,378.1 890.5,376.0 883.6,363.5 882.7,366.7 880.1,367.2 883.3,361.7 882.7,358.2 877.7,366.3 872.7,358.3 864.3,355.0 827.6,366.7 819.8,364.3 821.9,356.6 814.3,338.1 817.3,338.6 816.6,324.5 836.4,317.1 850.0,299.2 860.0,303.2 862.7,294.3 868.8,293.5 866.6,290.3 879.3,292.7 876.1,302.4 890.6,310.9 895.9,288.9 906.3,314.9 918.5,326.0 926.8,346.0 916.6,374.3 906.2,378.1Z M375.8,63.7 356.8,52.0 362.1,49.9 354.0,46.8 359.8,45.6 351.4,44.5 360.1,41.9 350.9,44.2 354.9,41.9 350.3,40.9 357.1,40.3 350.5,40.1 360.4,38.7 350.9,39.9 360.2,38.5 351.5,37.2 359.3,36.6 360.4,31.7 348.3,29.8 359.6,30.8 352.8,27.3 356.4,26.3 344.8,26.5 349.2,23.9 340.8,18.8 344.0,17.3 330.8,12.2 309.6,12.5 301.8,9.4 316.2,7.6 297.1,5.8 321.8,0.0 451.0,0.0 438.9,7.4 449.2,10.1 436.8,10.5 446.2,13.6 437.5,14.2 447.3,17.6 437.5,18.9 443.3,20.8 423.0,21.9 439.1,26.3 440.3,30.2 421.2,25.5 429.4,27.8 420.6,31.5 438.6,31.5 409.5,36.2 403.4,43.6 385.7,47.3 387.5,52.0 380.1,55.0 382.9,56.1 378.8,60.1 380.9,62.0 375.8,63.7Z M916.7,286.9 910.3,287.0 902.1,278.4 895.0,280.9 898.3,282.7 896.2,284.5 886.0,281.1 883.7,271.9 871.7,264.1 869.2,267.8 866.5,263.7 872.1,261.5 863.7,259.4 867.8,255.9 872.2,257.1 875.3,265.6 883.0,259.5 901.5,267.0 916.7,286.9Z M819.4,267.6 806.3,264.3 802.5,251.1 808.8,250.5 825.4,232.5 831.3,237.7 825.0,243.4 830.6,251.7 827.5,251.2 819.4,267.6Z M625.0,336.0 620.1,325.9 623.6,318.5 622.0,310.5 631.1,304.1 636.9,292.9 640.2,304.0 630.8,334.4 625.0,336.0Z M316.7,57.5 296.4,48.9 283.2,49.6 299.9,42.5 286.1,31.9 251.3,28.4 264.5,28.9 261.0,25.4 266.3,25.5 261.9,22.6 273.5,20.0 277.2,23.1 275.1,25.9 284.1,26.3 280.9,24.7 284.5,23.1 293.9,25.3 291.5,28.1 303.9,28.5 301.3,31.8 310.3,30.2 305.5,33.1 313.3,32.8 305.4,33.3 314.7,34.5 307.2,35.6 329.7,42.5 323.5,48.2 318.1,45.4 321.2,43.5 311.3,42.6 313.5,44.5 310.5,46.4 317.5,48.3 320.8,53.4 308.4,51.7 316.7,57.5Z M793.7,273.6 782.2,265.0 764.5,237.0 770.8,238.1 788.1,253.9 786.9,257.1 794.7,265.1 793.7,273.6Z M877.8,147.4 875.9,144.2 863.5,145.6 878.0,141.2 893.0,122.8 891.3,141.1 879.8,143.2 877.8,147.4Z M217.3,35.0 174.0,31.7 190.4,30.8 169.1,26.2 182.0,21.1 200.7,26.7 199.3,21.7 203.4,21.3 209.8,28.6 219.5,31.3 212.4,32.8 217.3,35.0Z M500.0,93.0 484.1,95.4 493.5,89.8 485.2,89.6 492.6,84.9 491.5,79.7 485.7,80.1 486.8,75.8 483.9,78.7 486.1,68.1 491.6,68.0 487.7,71.7 494.9,71.3 489.3,76.1 504.9,87.7 500.0,93.0Z M303.6,0.0 283.2,2.1 293.2,3.1 280.9,3.0 292.8,4.5 281.3,8.6 272.3,7.4 282.3,11.3 250.9,10.9 259.4,9.0 254.9,6.8 265.4,8.6 271.4,6.1 264.5,7.9 265.0,4.5 258.7,4.0 273.7,3.0 261.8,0.0 303.6,0.0Z M834.6,272.7 829.9,263.7 833.5,252.5 847.7,249.4 845.3,253.5 834.2,253.5 835.2,259.3 842.9,257.3 836.9,260.7 841.3,268.9 837.6,270.0 835.4,263.2 834.6,272.7Z M972.2,402.1 963.0,402.0 963.4,399.1 978.1,384.9 984.2,385.4 972.2,402.1Z M817.9,279.6 799.6,279.5 792.2,276.3 808.4,275.3 817.9,279.6Z M985.9,385.4 982.6,379.9 985.9,372.8 984.7,372.8 979.7,364.5 989.0,374.8 996.0,374.9 985.9,385.4Z M353.8,103.4 335.0,102.3 344.7,90.4 342.0,97.0 351.4,97.8 350.2,102.4 353.8,103.4Z M294.0,190.3 284.1,191.6 285.4,189.0 272.6,182.6 270.1,182.5 266.6,185.0 264.0,185.2 266.6,182.5 274.6,180.9 294.0,190.3Z M844.4,213.5 835.1,210.8 835.1,195.7 839.8,196.3 837.9,208.9 844.4,213.5Z M462.5,47.5 436.9,51.6 440.7,49.7 433.2,48.1 439.8,46.3 431.9,46.2 455.0,42.9 462.5,47.5Z M847.2,236.2 843.6,229.9 838.6,232.2 848.4,223.5 851.7,231.6 847.2,236.2Z M482.5,88.4 471.1,89.7 475.8,87.1 472.4,87.4 475.3,85.3 471.9,82.0 482.9,78.9 482.5,88.4Z M897.9,121.0 890.2,119.2 892.2,121.7 888.8,122.5 888.4,119.1 894.2,109.8 905.0,116.6 897.9,121.0Z M894.4,108.4 893.4,88.1 896.4,81.4 902.1,99.9 897.2,98.3 898.9,107.1 894.4,108.4Z M310.2,195.5 301.6,198.8 293.1,196.1 299.0,195.8 297.7,191.3 310.2,195.5Z M179.7,20.6 158.1,28.4 150.0,25.6 156.2,19.9 153.5,18.0 179.7,20.6Z M722.9,235.7 721.4,228.7 722.8,223.5 727.4,232.4 722.9,235.7Z M905.6,392.8 901.9,384.4 911.3,384.7 911.1,392.5 905.6,392.8Z M256.3,17.7 231.1,9.6 279.6,16.3 256.3,17.7Z M319.1,428.9 300.1,428.8 308.4,428.3 304.4,422.9 309.0,422.2 319.1,428.9Z M690.0,12.1 649.1,19.8 690.6,9.7 690.0,12.1Z M277.4,51.7 269.4,50.4 257.9,52.3 262.2,44.9 277.4,51.7Z M191.6,15.0 173.2,15.1 180.8,11.1 197.5,14.4 193.3,11.6 196.9,10.1 207.2,13.2 187.9,17.8 182.1,16.9 191.6,15.0Z M238.3,3.2 249.1,2.4 231.5,0.0 264.2,2.3 253.2,5.9 238.3,3.2Z M542.9,9.6 538.7,7.9 547.2,6.6 537.8,6.2 548.3,5.0 536.1,5.7 529.6,1.4 559.8,4.0 542.9,9.6Z M361.6,260.6 360.2,255.1 365.6,255.7 361.6,260.6Z M863.0,156.1 859.9,148.6 863.8,147.0 866.9,149.9 863.0,156.1Z M835.7,184.7 833.7,179.5 837.7,174.2 838.9,175.2 835.7,184.7Z M922.7,268.0 915.6,274.9 912.0,272.5 922.7,268.0Z M263.9,27.8 258.4,28.0 250.0,27.2 252.4,21.7 259.6,19.6 264.4,19.9 260.3,23.2 263.9,27.8Z M802.8,196.3 803.5,191.4 808.1,191.1 806.7,195.4 802.8,196.3Z M231.9,23.1 224.4,27.5 214.8,23.3 230.7,19.9 226.4,22.3 231.9,23.1Z M660.0,29.6 642.8,26.0 657.0,21.8 653.3,25.8 660.0,29.6Z M157.6,100.5 146.1,93.6 143.2,93.1 151.5,94.5 157.6,100.5Z M844.4,287.6 847.6,282.4 853.6,281.6 844.4,287.6Z M541.7,137.9 535.2,135.2 534.7,133.7 543.5,132.9 541.7,137.9Z M236.1,25.5 235.3,19.1 249.5,19.4 238.1,23.0 240.4,24.1 236.1,25.5Z M523.5,130.6 522.7,124.4 525.6,123.4 526.8,129.6 523.5,130.6Z M903.9,14.4 880.5,14.1 885.5,12.1 903.9,14.4Z M872.7,148.9 866.7,148.6 873.9,145.8 872.7,148.9Z M858.1,254.2 856.8,257.7 854.6,255.5 853.9,251.5 855.4,247.7 858.1,254.2Z M855.6,264.6 858.4,263.7 862.0,264.3 863.5,267.1 855.6,264.6Z M963.9,326.0 958.2,322.9 955.5,318.8 963.9,326.0Z M229.8,14.7 223.3,13.7 214.3,13.9 226.4,10.6 229.8,14.7Z M168.9,8.6 179.6,8.6 159.5,12.9 168.9,8.6Z M825.0,283.8 827.6,280.6 831.1,282.2 825.0,283.8Z M777.8,3.5 757.9,1.4 778.1,0.6 777.8,3.5Z M574.2,0.0 565.7,2.6 550.1,0.0 574.2,0.0Z M841.7,281.4 837.9,283.2 832.8,282.6 834.5,281.0 841.7,281.4Z M225.0,35.3 227.9,32.2 235.7,35.4 231.8,36.8 225.0,35.3Z M843.2,220.4 841.7,226.0 842.2,219.8 843.2,220.4Z M848.6,216.0 847.3,217.4 845.2,214.7 848.6,216.0Z M886.0,280.5 883.8,278.8 886.4,278.9 886.0,280.5Z M796.4,264.4 792.0,261.5 792.6,260.1 794.6,259.9 796.4,264.4Z M832.5,221.3 825.5,228.2 831.9,218.4 832.5,221.3Z M838.9,221.6 838.6,216.9 842.1,217.9 842.0,219.2 838.9,221.6Z M225.0,6.7 209.9,5.5 213.1,4.0 207.1,2.1 225.0,6.7Z M778.7,6.4 784.7,1.9 793.0,4.8 778.7,6.4Z M279.6,23.1 275.5,19.9 288.7,22.7 279.6,23.1Z M288.4,197.7 284.1,197.9 282.4,196.3 288.4,197.7Z M835.6,286.8 833.3,286.8 830.4,285.1 835.6,286.8Z M333.8,108.3 329.7,109.7 329.0,108.2 332.2,105.0 330.1,109.2 333.8,108.3Z M995.0,310.0 994.2,313.0 992.4,312.0 995.0,310.0Z M70.0,192.6 67.3,194.3 67.1,190.2 70.0,192.6Z"

function projectOriginPoint(lat, lon) {
  return {
    x: ((lon + 180) / 360) * 1000,
    y: ((80 - lat) / 135) * 430,
  }
}

function OriginMap({ origins, selectedId, onSelect }) {
  const points = origins
    .map(origin => {
      const coords = ORIGIN_MAP_POINTS[origin.id]
      if (!coords) return null
      return { origin, ...projectOriginPoint(coords.lat, coords.lon) }
    })
    .filter(Boolean)

  return (
    <div className="ks-origin-map">
      <div className="ks-origin-map-topline">
        <span>CARTE DES PAYS PRODUCTEURS</span>
        <small>{points.length} affichés</small>
      </div>

      <svg
        className="ks-origin-world"
        viewBox="0 0 1000 430"
        role="img"
        aria-label="Carte interactive des origines café"
      >
        <path className="ks-origin-world-land" d={WORLD_MAP_PATH} />

        {points.map(({ origin, x, y }) => (
          <g
            key={origin.id}
            className={origin.id === selectedId ? 'ks-origin-marker is-active' : 'ks-origin-marker'}
            transform={`translate(${x} ${y})`}
            onClick={()=>onSelect(origin.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(origin.id)
              }
            }}
            role="button"
            tabIndex="0"
            aria-label={`Ouvrir la fiche ${origin.name}`}
          >
            <title>{origin.name} · {origin.region}</title>
            <circle className="ks-origin-marker-ring" r="10" />
            <circle className="ks-origin-marker-core" r="4.5" />
          </g>
        ))}
      </svg>

      <div className="ks-origin-map-legend">
        <span><i /> Pays documenté</span>
        <small>Clique sur un point pour sélectionner l'origine</small>
      </div>
    </div>
  )
}

function OriginFact({ label, value }) {
  if (!value) return null
  return (
    <div className="ks-origin-fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function OriginsPage({ harvestData, harvestLoading, harvestError }) {
  const [featuredId, setFeaturedId] = useState(() => {
    if (!ORIGIN_COUNTRIES.length) return null
    return ORIGIN_COUNTRIES[Math.floor(Math.random() * ORIGIN_COUNTRIES.length)].id
  })
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('Toutes')
  const [showCalendar, setShowCalendar] = useState(true)

  const featured = ORIGIN_COUNTRIES.find(origin => origin.id === featuredId) || ORIGIN_COUNTRIES[0]
  const regions = ['Toutes', ...Array.from(new Set(ORIGIN_COUNTRIES.map(origin => origin.region).filter(Boolean)))]

  const norm = value => String(value || '')
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const q = norm(query.trim())
  const visibleOrigins = ORIGIN_COUNTRIES.filter(origin => {
    const regionOk = region === 'Toutes' || origin.region === region
    const text = norm([
      origin.name,
      origin.region,
      origin.species,
      origin.varieties,
      origin.altitude,
      origin.harvestPeriod,
      origin.processing,
    ].filter(Boolean).join(' '))
    return regionOk && (!q || text.includes(q))
  })

  const pickAnother = () => {
    if (ORIGIN_COUNTRIES.length < 2) return
    const pool = ORIGIN_COUNTRIES.filter(origin => origin.id !== featured?.id)
    const next = pool[Math.floor(Math.random() * pool.length)]
    setFeaturedId(next.id)
  }

  const selectOrigin = (id, jumpToFeature = true) => {
    setFeaturedId(id)
    if (!jumpToFeature) return
    requestAnimationFrame(() => {
      document.getElementById('ks-origin-feature')?.scrollIntoView({ behavior:'smooth', block:'start' })
    })
  }

  const liveCount = Array.isArray(harvestData?.origins) ? harvestData.origins.length : null
  const liveSource = harvestData?.source || harvestData?.meta?.source || harvestData?.provider || null
  const liveUpdated = harvestData?.updatedAt || harvestData?.updated || harvestData?.generatedAt || null

  return (
    <section className="ks-editorial-page ks-origin-page ks-page-has-art">
      <PageOrnament page="harvest" />
      <PageIntro
        title="Origines"
        meta={`${ORIGIN_COUNTRIES.length} pays documentés · récoltes & saisonnalité`}
        deck="Un atlas vivant du café : comprendre les pays producteurs, leurs récoltes et ce qui façonne leurs cafés."
      />

      {featured && (
        <section className="ks-origin-feature" id="ks-origin-feature">
          <div className="ks-origin-feature-main">
            <div className="ks-origin-feature-eyebrow">
              <span>UNE ORIGINE À DÉCOUVRIR</span>
              <button onClick={pickAnother}>↻ Une autre origine</button>
            </div>

            <p className="ks-origin-region">{featured.region}</p>
            <h2>{featured.name}<span>.</span></h2>

            {featured.intro?.[0] && <p className="ks-origin-lead">{featured.intro[0]}</p>}
            {featured.intro?.[1] && <p className="ks-origin-copy">{featured.intro[1]}</p>}

            {featured.history && (
              <details className="ks-origin-history">
                <summary>Un peu d'histoire <span>↓</span></summary>
                <p>{featured.history}</p>
              </details>
            )}

            <p className="ks-origin-source">{featured.source}</p>
          </div>

          <aside className="ks-origin-facts" aria-label={`Repères sur ${featured.name}`}>
            <div className="ks-origin-facts-title">REPÈRES</div>
            <OriginFact label="Espèces" value={featured.species} />
            <OriginFact label="Variétés" value={featured.varieties} />
            <OriginFact label="Altitude" value={featured.altitude} />
            <OriginFact label="Récolte" value={featured.harvestPeriod} />
            <OriginFact label="Cueillette" value={featured.harvestMethod} />
            <OriginFact label="Traitement" value={featured.processing} />
          </aside>
        </section>
      )}

      <section className="ks-origin-live">
        <div className="ks-origin-section-head">
          <div>
            <span>SAISONNALITÉ</span>
            <h3>Calendrier des récoltes</h3>
          </div>
          <p>Flux dynamique</p>
        </div>

        <div className="ks-origin-live-card">
          <div className="ks-origin-live-copy">
            <span className="ks-origin-live-dot" />
            <div>
              <strong>
                {harvestLoading
                  ? 'Mise à jour du calendrier…'
                  : harvestError
                    ? 'Le calendrier live est temporairement indisponible'
                    : 'Calendrier live chargé'}
              </strong>
              <p>
                Les fiches pays ci-dessus sont documentaires. Les fenêtres d'achat et statuts ci-dessous
                proviennent du flux récoltes et restent séparés des anciens volumes historiques.
              </p>
              {!harvestLoading && !harvestError && harvestData && (
                <div className="ks-origin-live-meta">
                  {liveCount !== null && <span>{liveCount} origines suivies</span>}
                  {liveSource && <span>{liveSource}</span>}
                  {liveUpdated && <span>MAJ {String(liveUpdated)}</span>}
                </div>
              )}
            </div>
          </div>

          {harvestData && !harvestLoading && (
            <button className="ks-origin-calendar-toggle" onClick={()=>setShowCalendar(v=>!v)}>
              {showCalendar ? 'Fermer le calendrier' : 'Voir le calendrier détaillé'}
              <span>{showCalendar ? '↑' : '↓'}</span>
            </button>
          )}
        </div>

        {harvestError && <ErrMsg msg={harvestError} />}

        {showCalendar && harvestData && (
          <div className="ks-origin-calendar-legacy">
            <HarvestPanel data={harvestData} />
          </div>
        )}
      </section>

      <section className="ks-origin-browser">
        <div className="ks-origin-section-head">
          <div>
            <span>ATLAS</span>
            <h3>Explorer les origines</h3>
          </div>
          <p>{visibleOrigins.length} sur {ORIGIN_COUNTRIES.length}</p>
        </div>

        <div className="ks-origin-controls">
          <label className="ks-origin-search">
            <span>Rechercher</span>
            <input
              value={query}
              onChange={e=>setQuery(e.target.value)}
              placeholder="Pays, variété, process..."
            />
          </label>

          <div className="ks-origin-regions" aria-label="Filtrer par région">
            {regions.map(item => (
              <button
                key={item}
                className={region === item ? 'is-active' : ''}
                onClick={()=>setRegion(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="ks-origin-map-layout">
          <OriginMap
            origins={visibleOrigins}
            selectedId={featured?.id}
            onSelect={id=>selectOrigin(id, false)}
          />

          <aside className="ks-origin-map-results">
            <div className="ks-origin-map-results-head">
              <span>RÉSULTATS</span>
              <strong>{visibleOrigins.length}</strong>
            </div>

            <div className="ks-origin-map-results-list">
              {visibleOrigins.map(origin => (
                <button
                  key={origin.id}
                  className={origin.id === featured?.id ? 'is-active' : ''}
                  onClick={()=>selectOrigin(origin.id, false)}
                >
                  <span>{origin.region}</span>
                  <strong>{origin.name}</strong>
                  <small>{origin.harvestPeriod || origin.altitude || 'Fiche pays documentée'}</small>
                  <i>→</i>
                </button>
              ))}
            </div>
          </aside>
        </div>

        {featured && (
          <div className="ks-origin-map-selection">
            <div>
              <span>ORIGINE SÉLECTIONNÉE</span>
              <strong>{featured.name}</strong>
              <small>{featured.region}</small>
            </div>
            <button onClick={()=>selectOrigin(featured.id, true)}>
              Voir la fiche <span>↑</span>
            </button>
          </div>
        )}

        {!visibleOrigins.length && (
          <div className="ks-origin-empty">Aucune origine ne correspond à cette recherche.</div>
        )}
      </section>
    </section>
  )
}

function SiteHeader({ tab, setTab, refresh, lastRefresh, showMusic, setShowMusic, onMenu, menuOpen }) {
  const nav = NAV_TABS
  return (
    <header className="ks-site-header">
      <button className="ks-site-brand" onClick={()=>setTab('home')} aria-label="Retour à l'accueil">
        <span>GG<span>.</span></span>
      </button>

      <nav className="ks-site-nav" aria-label="Navigation principale">
        {nav.map(t => (
          <button key={t.id} className={tab === t.id ? 'is-active' : ''} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </nav>

      <div className="ks-site-actions">
        {lastRefresh && <span className="ks-last-refresh">MAJ {lastRefresh}</span>}
        <button onClick={refresh} aria-label="Actualiser les données" title="Actualiser">↺</button>
        <button className={showMusic ? 'is-active' : ''} onClick={()=>setShowMusic(v=>!v)} aria-label="Afficher la musique" title="Musique">♫</button>
        <button
          className={`ks-menu-button${menuOpen ? ' is-open' : ''}`}
          onClick={onMenu}
          aria-controls="ks-site-menu"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          <span></span><span></span>
        </button>
      </div>
    </header>
  )
}

function MarketTicker({ rows, updatedAt }) {
  return (
    <div className="ks-market-ticker">
      <div className="ks-market-track">
        {rows.map((m,i) => (
          <div className="ks-market-item" key={m.label || i}>
            <span>{m.label}</span>
            <strong>{m.val}{m.unit && <small>{m.unit}</small>}</strong>
            {m.chg && <em className={m.up ? 'up' : 'down'}>{m.up ? '▲' : '▼'}{m.chg}</em>}
          </div>
        ))}
        <div className="ks-market-updated"><span>Mis à jour</span><strong>{updatedAt}</strong></div>
      </div>
      <div className="ks-market-tools" aria-label="Raccourcis">
        <a href="https://bo3.gg/teams/vitality/matches" target="_blank" rel="noopener noreferrer" title="Team Vitality CS2">
          <img src="/vitality-logo.webp" alt="Vitality" />
        </a>
        <a href="https://cupping-secure.netlify.app" target="_blank" rel="noopener noreferrer" title="Cupping">
          <img src="/cupping-logo.png" alt="Cupping" />
        </a>
      </div>
    </div>
  )
}

function MusicPanel() {
  return (
    <section className="ks-music-panel">
      <div className="ks-music-head">Musique · GaufreGentille · {PLAYLISTS.length} playlists sur Suno</div>
      <div className="ks-music-grid">
        {PLAYLISTS.map(pl => (
          <a key={pl.url} href={pl.url} target="_blank" rel="noopener noreferrer" className="ks-playlist-card">
            <div className="ks-playlist-cover" style={{backgroundImage:`url(${pl.cover})`}}>
              <span>{pl.tracks} tracks</span>
            </div>
            <div className="ks-playlist-copy">
              <div><small>GaufreGentille</small><strong>{pl.name}</strong><em>{pl.vibe}</em></div>
              <b>▶ Suno</b>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

/* ---------- Application ---------- */

export default function App() {
  const [tab, setTab] = useState('home')
  const [showMusic, setShowMusic] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Une seule porte d'entree vers la navigation : elle sait lire goTo,
  // href et music, donc l'accueil, le menu et l'en-tete se comportent
  // pareil sans dupliquer la regle.
  const openTab = useCallback((id) => {
    const cible = TABS.find(t => t.id === id)
    if (!cible) return
    if (cible.href) { window.open(cible.href, '_blank', 'noopener,noreferrer'); return }
    if (cible.music) { setShowMusic(true); setTab('news'); return }
    setTab(cible.goTo || id)
    window.scrollTo({ top: 0 })
  }, [])

  const T = THEME
  const isHome = tab === 'home'

  const markets   = useFeed('/.netlify/functions/get-markets', pickMarkets, true)
  const news      = useFeed('/.netlify/functions/get-news',    pickNews,    isHome || tab === 'news')
  const science   = useFeed('/.netlify/functions/get-science', pickScience, tab === 'science')
  const gear      = useFeed('/.netlify/functions/get-gear',    pickGear,    tab === 'gear')
  const community = useFeed('/.netlify/functions/get-sprudge', pickSprudge, tab === 'reddit')
  const harvest   = useFeed('/.netlify/functions/get-harvest', pickHarvest, isHome || tab === 'harvest')

  const feeds = { news, science, gear, reddit: community, harvest }

  useEffect(() => {
    if (markets.data) setLastRefresh(new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}))
  }, [markets.data])

  const refresh = () => { markets.reload(); feeds[tab]?.reload() }
  const marketRows = markets.data?.rows?.length ? markets.data.rows : MARKET_PLACEHOLDER
  const mktTime = markets.data?.updatedAt || '--'
  const dateStr = new Intl.DateTimeFormat('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(new Date())

  return (
    <div className="ks-app">
      <GGCursor />

      <SiteMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={openTab}
        tabs={TABS}
      />

      {isHome ? (
        <HomePage
          setTab={setTab}
          onNavigate={openTab}
          onMenu={() => setMenuOpen(v => !v)}
          menuOpen={menuOpen}
          navTabs={NAV_TABS}
          news={news} markets={markets} harvest={harvest}
        />
      ) : (
        <>
          <SiteHeader
            tab={tab}
            setTab={setTab}
            refresh={refresh}
            lastRefresh={lastRefresh}
            showMusic={showMusic}
            setShowMusic={setShowMusic}
            onMenu={() => setMenuOpen(v => !v)}
            menuOpen={menuOpen}
          />
          <MarketTicker rows={marketRows} updatedAt={mktTime} />
          {showMusic && <MusicPanel />}

          <main className="ks-page-shell">
            {tab==='news' && (
              news.loading ? <Spinner label="Chargement des actualités..." /> :
              news.error ? <ErrMsg msg={news.error} /> :
              news.data?.length ? <NewsPage items={news.data} dateStr={dateStr} /> :
              <ErrMsg msg="Aucune actualité disponible pour le moment." />
            )}

            {tab==='instagram' && (
              <section className="ks-editorial-page ks-instagram-page ks-legacy-panel ks-page-has-art">
                <PageOrnament page="instagram" />
                <PageIntro title="Instagram" meta="Veille visuelle" />
                <div className="ks-instagram-panel-skin">
                  <InstaVeillePanel />
                </div>
              </section>
            )}

            {tab==='reddit' && (
              community.loading ? <Spinner label="Chargement de la communauté..." /> :
              community.error ? <ErrMsg msg={community.error} /> :
              community.data?.length ? (
                <section className="ks-editorial-page ks-community-page ks-legacy-panel ks-page-has-art">
                  <PageOrnament page="reddit" />
                  <PageIntro title="Communauté" meta={`The Sprudge Report · ${community.data.length} articles · ${dateStr}`} />
                  <div className="ks-legacy-grid">
                    {community.data.map((post,i) => <RedditCard key={post.url || post.title || i} post={post} i={i} T={T} />)}
                  </div>
                </section>
              ) : <ErrMsg msg="Aucun article disponible pour le moment." />
            )}

            {tab==='science' && (
              science.loading ? <Spinner label="Recherche d'articles scientifiques..." /> :
              science.error ? <ErrMsg msg={science.error} /> :
              science.data?.length ? (
                <section className="ks-editorial-page ks-science-page ks-legacy-panel ks-page-has-art">
                  <PageOrnament page="science" />
                  <PageIntro title="Science" meta={`${science.data.length} articles · via PubMed NCBI`} />
                  <div className="ks-science-list">
                    {science.data.map((item,i) => <SciCard key={item.url || item.title || i} item={item} i={i} T={T} />)}
                  </div>
                </section>
              ) : <ErrMsg msg="Aucun article scientifique disponible." />
            )}

            {tab==='gear' && (
              gear.loading ? <Spinner label="Chargement des nouveautés matériel..." /> :
              gear.error ? <ErrMsg msg={gear.error} /> :
              gear.data?.length ? (
                <section className="ks-editorial-page ks-gear-page ks-legacy-panel ks-page-has-art">
                  <PageOrnament page="gear" />
                  <PageIntro title="Matériel" meta={`${gear.data.length} nouveautés · moulins, machines, tasses, drippers`} />
                  <GearHeroCard item={gear.data[0]} T={T} />
                  <div className="ks-gear-grid">
                    {gear.data.slice(1).map((item,i) => <GearCard key={item.url || item.name || i} item={item} i={i} T={T} />)}
                  </div>
                </section>
              ) : <ErrMsg msg="Aucune nouveauté disponible." />
            )}

            {tab==='harvest' && (
              <OriginsPage
                harvestData={harvest.data}
                harvestLoading={harvest.loading}
                harvestError={harvest.error}
              />
            )}
          </main>
        </>
      )}
    </div>
  )
}
