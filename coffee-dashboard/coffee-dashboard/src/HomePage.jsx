import { useState, useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────────────────────
   HomePage — vitrine Kissa Soko

   Trois temps : l'ouverture (qui parle), la preuve de vie
   (« En ce moment », données réelles des flux), et l'atelier
   (ce que je fabrique). L'index des univers passe en bandeau,
   en bas, parce que la navigation est déjà dans l'en-tête.

   Le curseur maison est rendu par App, pas ici.
   ───────────────────────────────────────────────────────────── */

const GG_ORANGE = '#da5d16'

/* Index de mois aligné sur HarvestPanel : 1 à 12 pour 2026,
   13 à 18 pour le premier semestre 2027. */
function monthIndex(date = new Date()) {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  if (y === 2026) return m
  if (y === 2027 && m <= 6) return 12 + m
  return null
}

/* ── Vignettes gravées, dessinées au trait ──────────────────── */

function CraftMark({ kind }) {
  const p = {
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.4,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  return (
    <svg viewBox="0 0 40 40" className="ks-craft-mark" aria-hidden="true" {...p}>
      {kind === 'book' && <>
        <path d="M6 8c5-2 10-2 14 1 4-3 9-3 14-1v23c-5-2-10-2-14 1-4-3-9-3-14-1Z" />
        <path d="M20 9v23M10 14h6M10 19h6M24 14h6M24 19h6" />
      </>}
      {kind === 'cup' && <>
        <path d="M9 14h18v8a9 9 0 0 1-18 0Z" />
        <path d="M27 16h3a4 4 0 0 1 0 8h-3" />
        <path d="M7 33h22" />
        <path d="M15 9c0-2 2-2 2-4M21 9c0-2 2-2 2-4" />
      </>}
      {kind === 'atlas' && <>
        <path d="M20 33c-6-7-9-12-9-17a9 9 0 0 1 18 0c0 5-3 10-9 17Z" />
        <path d="M20 21c0-4 2-6 5-7M20 21c0-3-2-5-4-6M20 27v-6" />
      </>}
      {kind === 'game' && <>
        <rect x="6" y="14" width="28" height="15" rx="7" />
        <path d="M13 19v5M10.5 21.5h5M26 20.5h.01M29 24h.01" />
      </>}
      {kind === 'music' && <>
        <rect x="5" y="11" width="30" height="18" rx="3" />
        <circle cx="14" cy="20" r="3.2" /><circle cx="26" cy="20" r="3.2" />
        <path d="M17 20h6M9 25h3M28 25h3" />
      </>}
      {kind === 'dash' && <>
        <rect x="6" y="8" width="28" height="24" rx="3" />
        <path d="M6 15h28M12 22v5M18 19v8M24 24v3M30 21v6" />
      </>}
    </svg>
  )
}

/* ── Branche de caféier, ornement de l'atelier ──────────────── */

function BranchOrnament() {
  const leaf = (x, y, r, s) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0C14 -5 30 -3 40 6 30 15 14 17 0 12 -4 7 -4 5 0 0Z" />
      <path d="M2 6h34" />
    </g>
  )
  return (
    <svg viewBox="0 0 320 420" className="ks-branch" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M158 412C150 320 146 232 152 150c4-52 14-96 30-136" />
      {leaf(154, 348, -18, .95)} {leaf(150, 300, 196, .9)}
      {leaf(150, 262, -22, 1.05)} {leaf(147, 212, 200, 1)}
      {leaf(152, 172, -26, .9)} {leaf(158, 128, 204, .85)}
      <circle cx="140" cy="330" r="6" /><circle cx="128" cy="322" r="6" />
      <circle cx="170" cy="244" r="6" /><circle cx="182" cy="236" r="6" />
      <circle cx="136" cy="196" r="5.5" />
      <path d="M140 324v12M170 238v12M136 191v10" />
    </svg>
  )
}

/* ── La transformation : cerise, parche, grain vert ─────────── */
/* WebP anime a fond transparent : le sujet flotte sur le bloc
   encre. On ne le charge qu'a l'approche de la section, et pas
   du tout si l'utilisateur a demande moins d'animations. */

function Reveal() {
  const zoneRef = useRef(null)
  const [source, setSource] = useState('/grain-poster.webp')

  useEffect(() => {
    const el = zoneRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setSource('/grain.webp')
        io.disconnect()
      },
      { rootMargin: '400px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="ks-reveal" id="ks-reveal">
      <div className="ks-shell ks-reveal-grid">
        <div className="ks-reveal-copy">
          <span className="ks-reveal-kicker">DE LA CERISE AU GRAIN</span>
          <h2>Tout part<br />d&rsquo;un fruit<span>.</span></h2>
          <p>
            Dépulpage, fermentation, lavage, séchage, déparchage.
            Cinq gestes entre la cerise cueillie et le grain vert,
            et chacun décide de ce qu&rsquo;il restera dans la tasse.
          </p>
          <ol className="ks-reveal-steps">
            <li><i>01</i><span>Cerise</span></li>
            <li><i>02</i><span>Dépulpage</span></li>
            <li><i>03</i><span>Fermentation</span></li>
            <li><i>04</i><span>Séchage</span></li>
            <li><i>05</i><span>Grain vert</span></li>
          </ol>
        </div>

        <div className="ks-reveal-stage" ref={zoneRef} aria-hidden="true">
          <span className="ks-reveal-halo" />
          <img className="ks-reveal-art" src={source} alt="" />
        </div>
      </div>
    </section>
  )
}

/* ── En ce moment : la preuve de vie ────────────────────────── */

function LiveNow({ news, markets, harvest, setTab }) {
  const lead = news?.data?.[0]
  const arabica = markets?.data?.rows?.find(r => /arabica/i.test(r.label || ''))
  const nowIdx = monthIndex()
  const inHarvest = harvest?.data?.origins?.filter(
    o => o.cycles?.some(c => c.harvest?.includes(nowIdx))
  ).length

  return (
    <section className="ks-live" id="ks-live">
      <div className="ks-shell">
        <header className="ks-live-head">
          <span className="ks-eyebrow">EN CE MOMENT</span>
          <span className="ks-live-pulse" aria-hidden="true" />
        </header>

        <div className="ks-live-grid">
          <div className="ks-live-lead">
            {lead ? (
              <a href={lead.url} target="_blank" rel="noopener noreferrer" data-cursor="active">
                <span className="ks-live-source">
                  {lead.source}{lead.date ? ` · ${lead.date}` : ''}
                </span>
                <h2>{lead.title}</h2>
                {lead.summary && <p>{lead.summary}</p>}
                <span className="ks-live-more">LIRE L&apos;ARTICLE <b>&rarr;</b></span>
              </a>
            ) : (
              <div className="ks-live-placeholder">
                <h2>Le café, tous les jours.</h2>
                <p>
                  Actualités du secteur, recherche, origines et matériel,
                  rassemblés et relus chaque semaine.
                </p>
                <button onClick={() => setTab('news')} className="ks-live-more" data-cursor="active">
                  VOIR LES ACTUALITÉS <b>&rarr;</b>
                </button>
              </div>
            )}
          </div>

          <dl className="ks-live-facts">
            <div>
              <dt>Arabica ICE</dt>
              <dd>{arabica?.val ?? '—'}<i>{arabica?.unit || 'c/lb'}</i></dd>
            </div>
            <div>
              <dt>Origines en récolte</dt>
              <dd>{inHarvest ?? '—'}<i>pays</i></dd>
              <button onClick={() => setTab('harvest')} data-cursor="active">Voir le calendrier</button>
            </div>
            <div>
              <dt>Veille scientifique</dt>
              <dd>PubMed<i>NCBI</i></dd>
              <button onClick={() => setTab('science')} data-cursor="active">Derniers papiers</button>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

/* ── L'atelier : ce que je fabrique ─────────────────────────── */
/* Relis cette liste : c'est ta voix, pas la mienne. */

const CRAFTS = [
  { mark:'book',  name:'Tasse imparfaite',   state:'En écriture',
    line:"Un livre technique sur la torréfaction, écrit au fil des lots ratés." },
  { mark:'cup',   name:'Outil de cupping',   state:'En service',
    line:"Fiches de dégustation SCA, radar, export, pensé pour le QC de production.",
    href:'https://cupping-secure.netlify.app' },
  { mark:'atlas', name:'Atlas des variétés', state:'En chantier',
    line:"Généalogie et nomenclature, du genre Coffea aux hybrides F1." },
  { mark:'game',  name:'Mame Mame Roast',    state:'En développement',
    line:"Un roguelike incrémental de torréfaction, cartoon années 30.",
    href:'https://kissasoko.netlify.app/hangar-torref-843/' },
  { mark:'music', name:'Kowareta Kagami',    state:'Playlists', music:true,
    line:"壊れた鏡 — city pop et nuits urbaines, sous un autre nom." },
  { mark:'dash',  name:'Kissa Soko',         state:'Vivant',
    line:"Ce site. Veille, science, origines et matériel, au même endroit." },
]

function Workshop({ onMusic }) {
  return (
    <section className="ks-workshop">
      <div className="ks-workshop-art" aria-hidden="true"><BranchOrnament /></div>
      <div className="ks-shell">
        <header className="ks-workshop-head">
          <span className="ks-eyebrow">L&apos;ATELIER</span>
          <h2>Dix ans de café,<br />et tout ce qui déborde<span>.</span></h2>
          <p>
            Torréfacteur de métier. Le reste vient par dessus : un livre en cours,
            des outils pour l&apos;atelier, un jeu, de la musique. Kissa Soko est
            l&apos;endroit où tout ça tient ensemble.
          </p>
        </header>

        <ul className="ks-craft-list">
          {CRAFTS.map(c => {
            const inner = <>
              <span className="ks-craft-icon"><CraftMark kind={c.mark} /></span>
              <span className="ks-craft-body">
                <strong>{c.name}</strong>
                <span>{c.line}</span>
              </span>
              <em className="ks-craft-state">{c.state}</em>
            </>
            return (
              <li key={c.name}>
                {c.href
                  ? <a href={c.href} data-cursor="active">{inner}</a>
                  : <button onClick={() => c.music && onMusic()} data-cursor="active">{inner}</button>}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* ── Page ───────────────────────────────────────────────────── */

export default function HomePage({
  setTab, setShowMusic,
  tabs = [], navTabs = [], tiles = [],
  news, markets, harvest,
}) {
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 88)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const onNavigate = (id) => {
    const cible = tabs.find(t => t.id === id)
    setTab(cible?.goTo || id)
  }
  const onMusic = () => { setShowMusic(true); setTab('news') }
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return <div className="ks-home" style={{ '--ks-orange': GG_ORANGE }}>

    <header className={`ks-home-nav${stuck ? ' is-stuck' : ''}`}>
      <button className="ks-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        data-cursor="active" aria-label="Kissa Soko, retour en haut de page">
        <span className="ks-gg-logo">GG<span>.</span></span>
      </button>

      <nav className="ks-top-links" aria-label="Navigation principale">
        {navTabs.map(t => (
          <button key={t.id} onClick={() => onNavigate(t.id)}>{t.label}</button>
        ))}
      </nav>

      <button className="ks-menu-button" onClick={() => scrollTo('ks-universes')}
        data-cursor="active" aria-label="Aller à l'index des univers">
        <span></span><span></span>
      </button>
    </header>

    <main>
      {/* 1 — Ouverture */}
      <section className="ks-hero">
        <div className="ks-hero-art" aria-hidden="true">
          <img className="ks-hero-botanical" src="/kissa-hero-botanical.png" alt="" />
        </div>

        <div className="ks-shell ks-hero-shell">
          <div className="ks-hero-copy">
            <p className="ks-eyebrow">LE CAFÉ<br />SOUS TOUTES SES FORMES</p>
            <h1><span>GOOD</span><span>COFFEE</span><span>GO FURTHER</span></h1>
            <p className="ks-hero-sign">
              Dix ans dans le café, et un site pour tout ce que ça fabrique autour.
            </p>
            <button className="ks-explore" onClick={() => scrollTo('ks-reveal')} data-cursor="active">
              <i>&rarr;</i><span>EXPLORER</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2 — La transformation */}
      <Reveal />

      {/* 3 — Preuve de vie */}
      <LiveNow news={news} markets={markets} harvest={harvest} setTab={setTab} />

      {/* 4 — L'atelier */}
      <Workshop onMusic={onMusic} />

      {/* 5 — Index des univers */}
      <section className="ks-universes" id="ks-universes">
        <div className="ks-shell">
          <span className="ks-eyebrow">TOUT LE SITE</span>
          <nav className="ks-index-strip" aria-label="Index des univers">
            {tiles.map((t, i) => {
              const inner = <>
                <i>{String(i + 1).padStart(2, '0')}</i>
                <span>{t.label}</span>
                <b>&rarr;</b>
              </>
              return t.href
                ? <a key={t.id} href={t.href} data-cursor="active">{inner}</a>
                : <button key={t.id} data-cursor="active"
                    onClick={() => t.music ? onMusic() : onNavigate(t.id)}>{inner}</button>
            })}
          </nav>
        </div>
      </section>

      {/* 6 — Signature */}
      <section className="ks-closing">
        <div className="ks-closing-art" aria-hidden="true">
          <img className="ks-closing-botanical" src="/kissa-bottom-botanical.png" alt="" />
        </div>
        <div className="ks-shell ks-closing-shell">
          <div className="ks-closing-copy">
            <p className="ks-closing-kicker">PLUS QU&rsquo;UNE BOISSON</p>
            <h2>Le café comme<br />terrain de jeu<span>.</span></h2>
            <p>
              Origines, science, matériel, marché, culture et création.
              Kissa Soko rassemble tout ce qui fait bouger le café aujourd&rsquo;hui.
            </p>
            <button onClick={() => onNavigate('news')} className="ks-closing-link" data-cursor="active">
              <i></i><span>EN SAVOIR PLUS</span><b>&rarr;</b>
            </button>
            <div className="ks-footer-brand" aria-label="Kissa Soko">
              <img src="/kissa-soko-logo.png" alt="Kissa Soko" />
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
}
