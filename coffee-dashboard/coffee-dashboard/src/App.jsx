import { useState, useEffect, useCallback, useRef } from 'react'
import HarvestPanel from './components/HarvestPanel'
import InstaVeillePanel from './components/InstaVeillePanel'
import './kissa.css'

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
    name: 'Sakura',
    url: 'https://suno.com/playlist/b6243889-9e57-46cb-90ae-fad1f0adb8a0',
    tracks: '—',
    cover: '/playlist-sakura.jpg',
    vibe: 'Ambient · Cinematic · Japan',
  },
]

const TABS = [
  { id:'home',      label:'Accueil' },
  { id:'news',      label:'Actualités' },
  { id:'science',   label:'Science' },
  { id:'harvest',   label:'Origines' },
  { id:'gear',      label:'Matériel' },
  { id:'reddit',    label:'Communauté' },
  { id:'instagram', label:'Instagram' },
]

const MARKET_PLACEHOLDER = [
  { label:'Arabica ICE', val:'--', unit:'c/lb', chg:'', up:true  },
  { label:'Robusta ICE', val:'--', unit:'$/t',  chg:'', up:false },
  { label:'EUR/USD',     val:'--', unit:'',     chg:'', up:true  },
  { label:'BRL/USD',     val:'--', unit:'',     chg:'', up:true  },
]

const GG_ORANGE = '#da5d16'

const PAGE_ART = {
  news:      { src:'/kissa-hero-botanical.png',   className:'is-news' },
  science:   { src:'/kissa-bottom-botanical.png', className:'is-science' },
  harvest:   { src:'/kissa-hero-botanical.png',   className:'is-harvest' },
  gear:      { src:'/kissa-bottom-botanical.png', className:'is-gear' },
  reddit:    { src:'/kissa-hero-botanical.png',   className:'is-reddit' },
  instagram: { src:'/kissa-bottom-botanical.png', className:'is-instagram' },
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

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
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
  },[])

  return <>
    <div ref={cursorRef} className={`ggc-cursor ${active?'is-active':''}`} />
    <div ref={dotRef} className="ggc-cursor-dot" />
  </>
}

function HomePage({ setTab, setShowMusic }) {
  const onNavigate = (id) => setTab(id === 'market' ? 'news' : id)
  const onMusic = () => { setShowMusic(true); setTab('news') }
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 88)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive:true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToUniverses = () => document.getElementById('ks-universes')?.scrollIntoView({ behavior:'smooth', block:'start' })

  const tiles = [
    { id:'news',      label:'Actualités', image:'/tiles/actualites.png' },
    { id:'harvest',   label:'Origines',   image:'/tiles/origines.png' },
    { id:'science',   label:'Science',    image:'/tiles/science.png' },
    { id:'gear',      label:'Matériel',   image:'/tiles/materiel.png' },
    { id:'market',    label:'Marché',     image:'/tiles/marche.png' },
    { id:'reddit',    label:'Communauté', image:'/tiles/communaute.png' },
    { id:'instagram', label:'Instagram',  image:'/tiles/instagram.png' },
    { id:'music',     label:'Musique',    image:'/tiles/musique.png' },
    { id:'game',      label:'Jeu',        image:'/tiles/jeu.png', href:'https://kissasoko.netlify.app/hangar-torref-843/' },
  ]

  const openTile = (tile) => {
    if (tile.id === 'music') return onMusic()
    if (tile.href) return
    onNavigate(tile.id)
  }

  return <div className="ks-home" style={{'--ks-orange':GG_ORANGE}}>

    <header className={`ks-home-nav${stuck ? ' is-stuck' : ''}`}>
      <button className="ks-logo" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} data-cursor="active" aria-label="GG, retour en haut de page">
        <span className="ks-gg-logo">GG<span>.</span></span>
      </button>

      <nav className="ks-top-links" aria-label="Navigation principale">
        <button onClick={()=>onNavigate('news')}>ACTUALITÉS</button>
        <button onClick={()=>onNavigate('science')}>SCIENCE</button>
        <button onClick={()=>onNavigate('harvest')}>ORIGINES</button>
        <button onClick={()=>onNavigate('gear')}>MATÉRIEL</button>
        <button onClick={()=>onNavigate('market')}>MARCHÉ</button>
        <button onClick={()=>onNavigate('reddit')}>COMMUNAUTÉ</button>
      </nav>

      <button className="ks-menu-button" onClick={scrollToUniverses} data-cursor="active" aria-label="Voir les univers">
        <span></span><span></span>
      </button>
    </header>

    <main>
      <section className="ks-hero">
        <div className="ks-hero-art" aria-hidden="true">
          <img className="ks-hero-botanical" src="/kissa-hero-botanical.png" alt="" />
        </div>

        <div className="ks-shell ks-hero-shell">
          <div className="ks-hero-copy">
            <p className="ks-eyebrow">LE CAFÉ<br/>SOUS TOUTES SES FORMES</p>
            <h1><span>GOOD</span><span>COFFEE</span><span>GO FURTHER</span></h1>
            <button className="ks-explore" onClick={scrollToUniverses} data-cursor="active">
              <i>→</i><span>EXPLORER</span>
            </button>
          </div>

        </div>
      </section>

      <section className="ks-universes" id="ks-universes">
        <div className="ks-shell">
          <div className="ks-tile-grid">
            {tiles.map((tile, i) => {
              const content = <>
                <span className="ks-tile-photo" style={{backgroundImage:`url(${tile.image})`, backgroundPosition:'center'}} />
                <span className="ks-tile-shade" />
                <strong>{tile.label}</strong>
                <span className="ks-tile-arrow">→</span>
                <span className="ks-tile-index">{String(i+1).padStart(2,'0')}</span>
              </>

              return tile.href ? (
                <a key={tile.id} className="ks-tile" href={tile.href} data-cursor="active" aria-label={`Ouvrir ${tile.label}`}>
                  {content}
                </a>
              ) : (
                <button key={tile.id} className="ks-tile" onClick={()=>openTile(tile)} data-cursor="active" aria-label={`Ouvrir ${tile.label}`}>
                  {content}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="ks-closing">
        <div className="ks-closing-art" aria-hidden="true">
          <img className="ks-closing-botanical" src="/kissa-bottom-botanical.png" alt="" />
        </div>
        <div className="ks-shell ks-closing-shell">
          <div className="ks-closing-copy">
            <p className="ks-closing-kicker">PLUS QU’UNE BOISSON</p>
            <h2>Le café comme<br/>terrain de jeu<span>.</span></h2>
            <p>Origines, science, matériel, marché, culture et création. Kissa Soko rassemble tout ce qui fait bouger le café aujourd’hui.</p>
            <button onClick={()=>onNavigate('news')} className="ks-closing-link" data-cursor="active"><i></i><span>EN SAVOIR PLUS</span><b>→</b></button>
            <div className="ks-footer-brand" aria-label="Kissa Soko">
              <img src="/kissa-soko-logo.png" alt="Kissa Soko" />
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
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
    <div className={`ks-page-ornament ${art.className}`} aria-hidden="true">
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


function SiteHeader({ tab, setTab, refresh, lastRefresh, showMusic, setShowMusic }) {
  const nav = TABS.filter(t => t.id !== 'home')
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

  const T = THEME
  const isHome = tab === 'home'

  const markets   = useFeed('/.netlify/functions/get-markets', pickMarkets, !isHome)
  const news      = useFeed('/.netlify/functions/get-news',    pickNews,    tab === 'news')
  const science   = useFeed('/.netlify/functions/get-science', pickScience, tab === 'science')
  const gear      = useFeed('/.netlify/functions/get-gear',    pickGear,    tab === 'gear')
  const community = useFeed('/.netlify/functions/get-sprudge', pickSprudge, tab === 'reddit')
  const harvest   = useFeed('/.netlify/functions/get-harvest', pickHarvest, tab === 'harvest')

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

      {isHome ? (
        <HomePage setTab={setTab} setShowMusic={setShowMusic} />
      ) : (
        <>
          <SiteHeader
            tab={tab}
            setTab={setTab}
            refresh={refresh}
            lastRefresh={lastRefresh}
            showMusic={showMusic}
            setShowMusic={setShowMusic}
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
                <InstaVeillePanel />
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
              harvest.loading ? <Spinner label="Chargement du calendrier des origines..." /> :
              harvest.error ? <ErrMsg msg={harvest.error} /> :
              harvest.data ? (
                <section className="ks-editorial-page ks-harvest-page ks-legacy-panel ks-page-has-art">
                  <PageOrnament page="harvest" />
                  <PageIntro title="Origines" meta="Récoltes, fenêtres d'achat et saisonnalité" />
                  <HarvestPanel data={harvest.data} />
                </section>
              ) : <ErrMsg msg="Calendrier des origines indisponible." />
            )}
          </main>
        </>
      )}
    </div>
  )
}
