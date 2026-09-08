import { useState, useEffect, useCallback, useRef } from 'react'
import HarvestPanel from './components/HarvestPanel'
import InstaVeillePanel from './components/InstaVeillePanel'

// GaufreGentille brand palette
const BRAND = {
  yellow: '#fed238',
  orange: '#da5d16',
  purple: '#a06dd0',
  amber:  '#ea9524',
}

const DARK = {
  bg:      '#160d09',
  surf:    '#1d120d',
  surf2:   '#251711',
  surf3:   '#2d1d16',
  border:  '#3a271e',
  border2: '#4a3328',
  text:    '#fff8f2',
  dim:     '#d8c6ba',
  faint:   '#9c8172',
}

const LIGHT = {
  bg:      '#f4efe7',
  surf:    '#fffaf3',
  surf2:   '#f7f0e7',
  surf3:   '#eee4d8',
  border:  '#e2d5c8',
  border2: '#d4c1b2',
  text:    '#241711',
  dim:     '#715a4c',
  faint:   '#a58c7d',
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
  { id:'news',      label:'Actualites' },
  { id:'instagram', label:'Instagram'  },
  { id:'reddit',    label:'Communaute' },
  { id:'science',   label:'Science'    },
  { id:'gear',      label:'Ça fait du bruit' },
  { id:'harvest',   label:'Origines' },
]

const MARKET_PLACEHOLDER = [
  { label:'Arabica ICE', val:'--', unit:'c/lb', chg:'', up:true  },
  { label:'Robusta ICE', val:'--', unit:'$/t',  chg:'', up:false },
  { label:'EUR/USD',     val:'--', unit:'',     chg:'', up:true  },
  { label:'BRL/USD',     val:'--', unit:'',     chg:'', up:true  },
]

const GG_ORANGE = '#da5d16'

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
    <GGCursor />

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
            Lire l&apos;article <span style={{ fontSize:'1rem' }}>→</span>
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
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />
        </div>
        <div style={{ padding:'13px 15px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#7a9e78' }}>{item.field}</span>
            <span style={{ fontSize:9, color:T.faint }}>{item.date}</span>
          </div>
          <div style={{ fontSize:11, color:T.dim, marginBottom:5, fontStyle:'italic', fontWeight:500 }}>{item.journal}</div>
          <div style={{ fontSize:'1.05rem', fontWeight:700, color:T.text, lineHeight:1.38, marginBottom:6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.title}</div>
          <div style={{ fontSize:'0.92rem', color:T.dim, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.abstract}</div>
          <div style={{ marginTop:8, fontSize:'0.8rem', color:BRAND.purple, fontWeight:700 }}>Voir l&apos;article →</div>
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

/* ---------- Application ---------- */

export default function App() {
  const [tab, setTab]             = useState('home')
  const [dark, setDark]           = useState(true)
  const [showMusic, setShowMusic] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  const T = dark ? DARK : LIGHT
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
  const mktTime    = markets.data?.updatedAt || '--'

  const today = new Date()
  const DAYS   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
  const MONTHS = ['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre']
  const dateStr = `${DAYS[today.getDay()]} ${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`

  return (
    <div style={{ background:T.bg, minHeight:'100vh', color:T.text, fontFamily:"DM Sans,Inter,-apple-system,system-ui,sans-serif", fontWeight:500, fontSize:17, transition:'background 0.3s, color 0.3s', position:'relative', backgroundImage:`radial-gradient(circle at 15% -10%, ${BRAND.orange}0c, transparent 28%), radial-gradient(circle at 95% 8%, ${BRAND.purple}0b, transparent 24%)` }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,700;0,800;1,700;1,800&family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth}
        body{margin:0}
        button{font:inherit}
        a{color:inherit;}
        ::selection{background:${BRAND.yellow};color:#16110b}
        ::-webkit-scrollbar{width:7px;height:7px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${T.border2};border-radius:99px;}
.ggc-cursor{position:fixed;z-index:9999;left:0;top:0;width:14px;height:14px;border-radius:50%;pointer-events:none;background:rgba(218,93,22,.12);border:1px solid rgba(218,93,22,.48);backdrop-filter:blur(1.5px);transition:width .22s,height .22s,background .22s,border-color .22s;will-change:transform}
.ggc-cursor.is-active{width:24px;height:24px;background:rgba(218,93,22,.1);border-color:rgba(218,93,22,.72)}
.ggc-cursor-dot{position:fixed;z-index:10000;left:0;top:0;width:2px;height:2px;border-radius:50%;background:#da5d16;pointer-events:none;will-change:transform}

/* KISSA SOKO — editorial homepage */
.ks-home{--ks-paper:#f4ede3;--ks-paper-2:#f7f1e8;--ks-ink:#07172b;min-height:100vh;background:var(--ks-paper);color:var(--ks-ink);position:relative;overflow:hidden;cursor:none}
.ks-home button,.ks-home a{font-family:'DM Sans',Inter,sans-serif}
.ks-shell{max-width:1440px;margin:0 auto;padding-left:clamp(24px,4.5vw,68px);padding-right:clamp(24px,4.5vw,68px)}
.ks-home-nav{height:72px;width:100%;padding:0 clamp(24px,4.5vw,68px);display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:28px;position:absolute;inset:0 0 auto;z-index:60;background:transparent;border:0;pointer-events:auto;transition:background .22s ease}
.ks-home-nav.is-stuck{position:fixed;background:rgba(247,241,232,.58);-webkit-backdrop-filter:blur(20px) saturate(1.08);backdrop-filter:blur(20px) saturate(1.08);border:0;box-shadow:none;animation:ksNavDrop .24s cubic-bezier(.2,.8,.2,1) both}
@keyframes ksNavDrop{from{transform:translateY(-100%)}to{transform:translateY(0)}}
.ks-logo{border:0;background:transparent;padding:0;display:block;cursor:none;pointer-events:auto;color:var(--ks-ink)}
.ks-gg-logo{display:inline-block;font-family:'Bodoni Moda',Georgia,serif;font-style:italic;font-weight:800;font-size:clamp(38px,4vw,58px);line-height:.82;letter-spacing:-.08em}
.ks-gg-logo>span{color:var(--ks-orange);font-style:normal;margin-left:3px}
.ks-top-links{display:flex;align-items:center;justify-content:center;gap:clamp(16px,2vw,34px);min-width:0}
.ks-top-links button{border:0;background:transparent;padding:7px 0;color:var(--ks-ink);font-size:9px;font-weight:700;letter-spacing:.18em;cursor:none;white-space:nowrap;transition:color .18s ease,transform .18s ease}
.ks-top-links button:hover{color:var(--ks-orange);transform:translateY(-1px)}
.ks-menu-button{width:44px;height:44px;border-radius:50%;border:0;background:var(--ks-ink);display:grid;place-content:center;gap:6px;cursor:none;box-shadow:none;transition:transform .25s ease,background .25s ease}
.ks-menu-button span{display:block;width:17px;height:1.5px;border-radius:2px;background:#fff}.ks-menu-button:hover{transform:scale(1.06);background:#132942}

.ks-hero{min-height:min(790px,92vh);position:relative;padding:clamp(142px,15vh,190px) 0 62px;display:flex;align-items:center;isolation:isolate;overflow:hidden}
.ks-hero:after{content:'';position:absolute;left:clamp(24px,4.5vw,68px);right:clamp(24px,4.5vw,68px);bottom:0;height:1px;background:rgba(7,23,43,.12)}
.ks-hero-shell{position:relative;z-index:5;width:100%;display:flex;align-items:flex-start}
.ks-hero-copy{position:relative;z-index:5;width:min(69%,900px);padding-bottom:30px}
.ks-eyebrow{font:600 11px/1.65 'DM Sans',sans-serif;letter-spacing:.28em;color:#6d747a;margin:0 0 23px;text-transform:uppercase}
.ks-hero h1{font-family:'Bodoni Moda',Georgia,serif;font-style:italic;font-weight:800;font-size:clamp(68px,9.2vw,148px);line-height:.76;letter-spacing:-.075em;margin:0;color:var(--ks-ink);text-wrap:balance}
.ks-hero h1 span{display:block;white-space:nowrap}
.ks-explore{margin-top:42px;border:0;background:transparent;color:var(--ks-ink);padding:0;display:flex;align-items:center;gap:18px;cursor:none;font-size:10px;font-weight:700;letter-spacing:.24em}
.ks-explore i{font-style:normal;width:43px;height:43px;border-radius:50%;display:grid;place-items:center;background:var(--ks-orange);color:#fff;font-size:19px;letter-spacing:0;box-shadow:0 9px 22px rgba(218,93,22,.2);transition:transform .25s ease}
.ks-explore:hover i{transform:translateX(4px)}
.ks-hero-art{position:absolute;inset:0 0 0 auto;width:min(54vw,820px);pointer-events:none;display:flex;justify-content:flex-end;align-items:flex-start;z-index:1}
.ks-hero-botanical{position:absolute;right:0;top:0;width:100%;height:100%;object-fit:contain;object-position:top right;pointer-events:none;filter:none;opacity:1}

.ks-universes{position:relative;z-index:10;padding:28px 0 76px;scroll-margin-top:84px}
.ks-tile-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.ks-tile{height:clamp(220px,23vw,320px);position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.56);border-radius:12px;background:#20170f;color:#fff;text-decoration:none;text-align:left;cursor:none;padding:0;display:block;box-shadow:0 8px 24px rgba(44,28,18,.055);transition:transform .32s cubic-bezier(.2,.8,.2,1),box-shadow .32s ease}
.ks-tile-photo,.ks-tile-shade{position:absolute;inset:0}.ks-tile-photo{background-size:cover;background-position:center;transform:scale(1.015);filter:none;transition:transform .65s cubic-bezier(.2,.8,.2,1)}
.ks-tile-shade{background:rgba(7,12,16,.18)}
.ks-tile strong{position:absolute;z-index:3;left:24px;bottom:25px;color:#fff;font:700 clamp(18px,1.6vw,25px)/1 'DM Sans',sans-serif;letter-spacing:-.025em;text-shadow:0 2px 16px rgba(0,0,0,.32)}
.ks-tile-arrow{position:absolute;z-index:3;left:23px;top:23px;width:35px;height:35px;border:1px solid rgba(255,255,255,.78);border-radius:50%;display:grid;place-items:center;font-size:15px;transition:background .25s,color .25s,transform .25s}
.ks-tile-index{position:absolute;z-index:3;right:20px;top:20px;font-size:8px;letter-spacing:.2em;font-weight:700;opacity:.56}
.ks-tile:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(44,28,18,.13)}.ks-tile:hover .ks-tile-photo{transform:scale(1.065);filter:none}.ks-tile:hover .ks-tile-arrow{background:var(--ks-orange);border-color:var(--ks-orange);transform:translateX(3px)}

.ks-closing{min-height:520px;position:relative;padding:88px 0 95px;display:flex;align-items:center;overflow:hidden;border-top:1px solid rgba(7,23,43,.08)}
.ks-closing-shell{position:relative;z-index:4;width:100%}
.ks-closing-copy{position:relative;z-index:4;width:min(48%,600px)}
.ks-closing-kicker{font-size:9px;font-weight:600;letter-spacing:.28em;color:#7c7b76;margin-bottom:19px}
.ks-closing h2{font-family:'Bodoni Moda',Georgia,serif;font-weight:800;font-size:clamp(51px,6.5vw,92px);line-height:.87;letter-spacing:-.055em;margin:0;color:var(--ks-ink)}
.ks-closing h2 span{color:var(--ks-orange)}
.ks-closing-copy>p:not(.ks-closing-kicker){max-width:480px;margin-top:25px;color:#34404b;font:500 16px/1.65 'DM Sans',sans-serif}
.ks-closing-link{margin-top:30px;border:0;background:transparent;padding:0;display:flex;align-items:center;gap:15px;color:var(--ks-ink);cursor:none;font-size:9px;font-weight:700;letter-spacing:.23em}.ks-closing-link i{display:block;width:64px;height:1px;background:rgba(7,23,43,.42)}.ks-closing-link b{font-size:16px;color:var(--ks-orange);font-weight:400;letter-spacing:0;transition:transform .2s}.ks-closing-link:hover b{transform:translateX(4px)}
.ks-footer-brand{margin-top:54px;display:flex;align-items:center}.ks-footer-brand img{display:block;width:clamp(110px,9vw,150px);height:auto;object-fit:contain}
.ks-closing-art{position:absolute;inset:0 0 0 auto;width:min(56vw,860px);pointer-events:none;display:flex;justify-content:flex-end;align-items:flex-end;z-index:0}
.ks-closing-botanical{position:absolute;right:0;bottom:0;width:100%;height:100%;object-fit:contain;object-position:bottom right;pointer-events:none;filter:none;opacity:1}

@media(max-width:980px){
  .ks-top-links{gap:14px}.ks-top-links button{font-size:8px;letter-spacing:.13em}
  .ks-hero{min-height:720px;align-items:flex-end;padding-top:130px;padding-bottom:74px}.ks-hero-copy{width:76%}.ks-hero h1{font-size:clamp(62px,11vw,108px)}.ks-hero-art{width:67vw}
  .ks-tile-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ks-tile{height:300px}.ks-closing-copy{width:58%}.ks-closing-art{width:72vw}
}
@media(max-width:640px){
  .ks-home{cursor:auto}.ks-home .ggc-cursor,.ks-home .ggc-cursor-dot{display:none}.ks-home-nav{height:68px;padding:0 18px;grid-template-columns:auto 1fr auto}.ks-home-nav.is-stuck{background:rgba(247,241,232,.58);-webkit-backdrop-filter:blur(20px) saturate(1.08);backdrop-filter:blur(20px) saturate(1.08)}.ks-top-links{display:none}.ks-menu-button{width:42px;height:42px}.ks-gg-logo{font-size:42px}
  .ks-shell{padding-left:14px;padding-right:14px}
  .ks-hero{min-height:0;padding:218px 0 40px;align-items:flex-start}.ks-hero-copy{width:100%;padding-bottom:0}.ks-eyebrow{font-size:8px;margin-bottom:16px}.ks-hero h1{font-size:clamp(44px,14.3vw,67px);line-height:.82;letter-spacing:-.06em}.ks-hero-art{width:72vw;height:205px;top:18px;bottom:auto}.ks-hero-botanical{right:-8vw;top:0;opacity:1}.ks-explore{margin-top:26px}.ks-hero:after{left:14px;right:14px}
  .ks-universes{padding:14px 0 46px}.ks-tile-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.ks-tile{height:174px;border-radius:9px}.ks-tile strong{left:14px;bottom:15px;font-size:15px}.ks-tile-arrow{left:13px;top:13px;width:29px;height:29px;font-size:13px}.ks-tile-index{right:12px;top:12px;font-size:7px}.ks-tile:last-child{grid-column:1/-1;height:205px}
  .ks-closing{min-height:560px;padding:62px 0 70px;align-items:flex-start}.ks-closing-copy{width:82%}.ks-closing h2{font-size:clamp(44px,12.5vw,62px)}.ks-closing-copy>p:not(.ks-closing-kicker){font-size:13px;max-width:95%}.ks-closing-art{width:62vw;height:300px;right:0;top:auto;bottom:0}.ks-closing-botanical{right:-10vw;bottom:0;opacity:1}.ks-footer-brand{margin-top:38px}.ks-footer-brand img{width:112px}
}

@media(prefers-reduced-motion:reduce){.ks-home *{scroll-behavior:auto!important;animation:none!important;transition-duration:.01ms!important}.ggc-cursor,.ggc-cursor-dot{display:none}}
`}</style>

      {tab !== 'home' && <>
      {/* TOPBAR */}
      <div style={{ background:`${T.bg}e8`, borderBottom:`1px solid ${T.border}`, padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(20px) saturate(140%)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>setTab('home')} style={{display:'flex',alignItems:'center',gap:13,border:0,background:'transparent',padding:0,cursor:'pointer',color:T.text,textAlign:'left'}}>
            <strong style={{fontFamily:'Manrope, sans-serif',fontSize:25,lineHeight:1,fontWeight:800,letterSpacing:'-0.08em',color:BRAND.orange}}>GG</strong>
            <span style={{fontSize:9,color:T.faint,letterSpacing:'0.13em',textTransform:'uppercase',fontWeight:700}}>veille · science · culture café</span>
          </button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'0.63rem', color:T.faint }}>{dateStr}</span>
          {lastRefresh && <span style={{ fontSize:'0.62rem', color:T.faint, display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#7a9e78', display:'inline-block' }} />{lastRefresh}
          </span>}
          <button onClick={refresh} style={{ background:T.surf2, border:`1px solid ${T.border2}`, color:T.dim, fontSize:'0.72rem', padding:'5px 11px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
            ↺
          </button>
          <button onClick={()=>setDark(!dark)} style={{ background: dark ? BRAND.yellow+'22' : BRAND.purple+'22', border:`1px solid ${dark ? BRAND.yellow+'44' : BRAND.purple+'44'}`, color: dark ? BRAND.yellow : BRAND.purple, fontSize:'0.72rem', padding:'5px 11px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontWeight:600, transition:'all 0.2s' }}>
            {dark ? '☀ Clair' : '☾ Sombre'}
          </button>
        </div>
      </div>

      {/* MARKETS STRIP */}
      <div style={{ background:`${T.surf}d9`, borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', padding:'0 24px', minHeight:66, backdropFilter:'blur(18px)' }}>
        <div style={{ display:'flex', flex:1, overflowX:'auto' }}>
          {marketRows.map((m,i) => (
            <div key={m.label || i} style={{ padding:'9px 24px 9px 20px', minWidth:140, borderRight:`1px solid ${T.border}`, flexShrink:0 }}>
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
        {/* Raccourcis : musique, Vitality, cupping */}
        <div style={{ display:'flex', alignItems:'center', gap:12, paddingLeft:24, borderLeft:`1px solid ${T.border}`, flexShrink:0 }}>
          <button onClick={() => setShowMusic(v => !v)} style={{
            background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:8,
            opacity: showMusic ? 1 : 0.65, transition:'all 0.2s',
            transform: showMusic ? 'scale(1.05)' : 'scale(1)',
          }} title="Musique · GaufreGentille">
            <img src="/gg-logo.png" alt="GaufreGentille Musique" style={{ width:62, height:62, borderRadius:8, objectFit:'cover', display:'block' }} />
          </button>
          <a href="https://bo3.gg/teams/vitality/matches" target="_blank" rel="noopener noreferrer"
            style={{ display:'block', padding:4, borderRadius:8, opacity:0.65, transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity='1'}
            onMouseLeave={e => e.currentTarget.style.opacity='0.65'}
            title="Team Vitality CS2 · bo3.gg">
            <img src="/vitality-logo.webp" alt="Team Vitality" style={{ width:62, height:62, borderRadius:8, objectFit:'cover', display:'block' }} />
          </a>
          <a href="https://cupping-secure.netlify.app" target="_blank" rel="noopener noreferrer"
            style={{ display:'block', padding:4, borderRadius:8, opacity:0.65, transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity='1'}
            onMouseLeave={e => e.currentTarget.style.opacity='0.65'}
            title="Cupping · fiches de dégustation">
            <img src="/cupping-logo.png" alt="Cupping" style={{ width:62, height:62, borderRadius:8, objectFit:'cover', display:'block' }} />
          </a>
        </div>
      </div>

      {/* MUSIC PANEL */}
      {showMusic && (
        <div style={{ background:T.surf, borderBottom:`1px solid ${BRAND.purple}44`, padding:'20px', animation:'fadeUp 0.2s ease both' }}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.15em', color:T.dim, fontWeight:600, marginBottom:20, paddingBottom:12, borderBottom:`1px solid ${T.border}` }}>
            Musique · GaufreGentille · {PLAYLISTS.length} playlists sur Suno
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
            {PLAYLISTS.map((pl) => (
              <a key={pl.url} href={pl.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
                <div style={{
                  background:T.surf2, border:`1px solid ${T.border}`,
                  borderRadius:14, overflow:'hidden', cursor:'pointer', transition:'all 0.22s',
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=BRAND.amber+'88'; e.currentTarget.style.transform='translateY(-3px)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.transform='translateY(0)' }}
                >
                  <div style={{ height:180, backgroundImage:`url(${pl.cover})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' }}>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                    <div style={{ position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', borderRadius:20, padding:'2px 9px', fontSize:10, color:'#fff', fontWeight:600 }}>{pl.tracks} tracks</div>
                    <div style={{ position:'absolute', bottom:12, left:14 }}>
                      <div style={{ fontSize:'0.6rem', color:BRAND.amber, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>GaufreGentille</div>
                      <div style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem', fontWeight:700, color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,0.8)' }}>{pl.name}</div>
                    </div>
                  </div>
                  <div style={{ padding:'12px 14px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontSize:'0.75rem', color:T.dim, fontStyle:'italic' }}>{pl.vibe}</div>
                    <div style={{ background:BRAND.amber, color:'#000', fontSize:'0.68rem', fontWeight:700, padding:'4px 12px', borderRadius:20 }}>▶ Suno</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* TAB BAR */}
      <div style={{ background:`${T.bg}e6`, borderBottom:`1px solid ${T.border}`, display:'flex', gap:5, padding:'8px max(20px, calc((100vw - 1180px)/2))', overflowX:'auto', position:'sticky', top:64, zIndex:90, backdropFilter:'blur(18px) saturate(140%)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background: tab===t.id ? T.surf3 : 'transparent', border:`1px solid ${tab===t.id ? T.border2 : 'transparent'}`,
            borderRadius:11,
            color: tab===t.id ? T.text : T.dim,
            fontWeight: tab===t.id ? 700 : 500,
            fontSize:'0.78rem', padding:'8px 13px', letterSpacing:'0.015em',
            cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.18s', fontFamily:'inherit',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      </>}

      {/* CONTENT */}
      <div style={{ maxWidth: tab==='home' ? 'none' : 1040, margin:'0 auto', padding: tab==='home' ? 0 : '28px 18px 110px' }}>

        {/* ACCUEIL */}
        {tab==='home' && (
          <HomePage setTab={setTab} setShowMusic={setShowMusic} />
        )}

        {/* ACTUALITES */}
        {tab==='news' && (
          news.loading ? <Spinner label="Chargement des actualités..." T={T} /> :
          news.error   ? <ErrMsg msg={news.error} T={T} /> :
          news.data?.length ? (
            <div>
              <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.18em', color:T.faint, marginBottom:16, paddingBottom:10, borderBottom:`1px solid ${T.border}` }}>
                Actualités du secteur · {news.data.length} articles · {dateStr}
              </div>
              <HeroCard item={news.data[0]} T={T} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
                {news.data.slice(1).map((item,i) => <NewsCard key={item.url || i} item={item} img={IMG[(i+1)%IMG.length]} i={i} T={T} />)}
              </div>
            </div>
          ) : <ErrMsg msg="Aucune actualité disponible pour le moment." T={T} />
        )}

        {/* INSTAGRAM */}
        {tab==='instagram' && (
          <InstaVeillePanel />
        )}

        {/* COMMUNAUTE */}
        {tab==='reddit' && (
          community.loading ? <Spinner label="Chargement de la communauté..." T={T} /> :
          community.error   ? <ErrMsg msg={community.error} T={T} /> :
          community.data?.length ? (
            <div>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.15em', color:T.dim, fontWeight:600, marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${T.border}` }}>
                Communauté · The Sprudge Report · {community.data.length} articles · {dateStr}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
                {community.data.map((post,i) => <RedditCard key={post.url || i} post={post} i={i} T={T} />)}
              </div>
            </div>
          ) : <ErrMsg msg="Aucun article disponible pour le moment." T={T} />
        )}

        {/* SCIENCE */}
        {tab==='science' && (
          science.loading ? <Spinner label="Recherche d'articles scientifiques..." T={T} /> :
          science.error   ? <ErrMsg msg={science.error} T={T} /> :
          science.data?.length ? (
            <div>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.15em', color:T.dim, fontWeight:600, marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${T.border}` }}>
                Articles scientifiques · {science.data.length} articles · via PubMed NCBI
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {science.data.map((item,i) => <SciCard key={item.url || i} item={item} img={SCI_IMG[i%SCI_IMG.length]} i={i} T={T} />)}
              </div>
            </div>
          ) : <ErrMsg msg="Aucun article scientifique disponible." T={T} />
        )}

        {/* MATERIEL */}
        {tab==='gear' && (
          gear.loading ? <Spinner label="Chargement des nouveautés matériel..." T={T} /> :
          gear.error   ? <ErrMsg msg={gear.error} T={T} /> :
          gear.data?.length ? (
            <div>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.15em', color:T.dim, fontWeight:600, marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${T.border}` }}>
                Ça fait du bruit · {gear.data.length} nouveautés · moulins, machines, tasses, drippers...
              </div>
              <GearHeroCard item={gear.data[0]} T={T} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
                {gear.data.slice(1).map((item,i) => <GearCard key={item.url || i} item={item} i={i} T={T} />)}
              </div>
            </div>
          ) : <ErrMsg msg="Aucune nouveauté disponible." T={T} />
        )}

        {/* ORIGINES */}
        {tab==='harvest' && (
          harvest.loading ? <Spinner label="Chargement du calendrier des origines..." T={T} /> :
          harvest.error   ? <ErrMsg msg={harvest.error} T={T} /> :
          harvest.data ? <HarvestPanel data={harvest.data} />
                       : <ErrMsg msg="Calendrier des origines indisponible." T={T} />
        )}
      </div>
    </div>
  )
}
