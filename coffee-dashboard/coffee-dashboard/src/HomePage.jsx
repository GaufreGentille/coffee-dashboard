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
/* MP4 muet en boucle. L'affiche fixe s'affiche d'abord ; la video
   n'est telechargee qu'a l'approche de la section, et mise en pause
   des qu'elle en sort. Rien ne se charge si l'utilisateur a demande
   moins d'animations. */

function Reveal() {
  const videoRef = useRef(null)
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const near = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setArmed(true); near.disconnect() } },
      { rootMargin: '500px' }
    )
    const visible = new IntersectionObserver(
      ([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause() },
      { threshold: .15 }
    )
    near.observe(v)
    visible.observe(v)
    return () => { near.disconnect(); visible.disconnect() }
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

        <figure className="ks-reveal-plate">
          <video
            ref={videoRef}
            className="ks-reveal-art"
            src={armed ? '/grain.mp4' : undefined}
            poster="/grain-poster.webp"
            muted loop playsInline preload="none"
            aria-hidden="true"
          />
          <figcaption>
            <span>PLANCHE 01</span>
            <em>Coffea arabica</em>
            <small>cerise · parche · grain vert</small>
          </figcaption>
        </figure>
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

/* ── L'aventure café : les chapitres de Tasse imparfaite ───── */

const COFFEE_JOURNEY = [
  {
    id:'taxonomie', chapter:'01', title:'Taxonomie', kicker:'LE VIVANT',
    summary:"Morphologie, espèces, groupes génétiques et variétés : comprendre Coffea avant même de parler de goût.",
    href:'/tasse-imparfaite#chapitre-1', x:'8%', y:'35%', card:'down', mark:'leaf',
  },
  {
    id:'histoire', chapter:'02', title:'Histoire', kicker:'LES ROUTES',
    summary:"Du Rift au Yémen, puis au reste du monde : domestication, routes commerciales, Typica, Bourbon et sélection.",
    href:'/tasse-imparfaite#chapitre-2', x:'25%', y:'20%', card:'down', mark:'route',
  },
  {
    id:'process', chapter:'03', title:'Process', kicker:'LA TRANSFORMATION',
    summary:"Lavé, nature, honey et fermentations : ce qui arrive au fruit après la récolte façonne déjà la tasse.",
    href:'/tasse-imparfaite#chapitre-3', x:'44%', y:'36%', card:'down', mark:'process',
  },
  {
    id:'chimie', chapter:'04', title:'Chimie aromatique', kicker:'LES MOLÉCULES',
    summary:"Précurseurs, réactions et composés aromatiques : relier ce qui se passe dans le grain à ce que l'on perçoit.",
    href:'/tasse-imparfaite#chapitre-4', x:'63%', y:'19%', card:'down', mark:'molecule',
  },
  {
    id:'defauts', chapter:'05', title:'Défauts', kicker:'LES ACCIDENTS',
    summary:"Identifier ce qui a mal tourné, du fruit au stockage puis à la torréfaction, et remonter jusqu'à la cause.",
    href:'/tasse-imparfaite#chapitre-5', x:'82%', y:'36%', card:'left', mark:'defect',
  },
  {
    id:'extraction', chapter:'06', title:'Extraction', kicker:'LA TASSE',
    summary:"Eau, mouture, température, temps et pression : la dernière transformation avant la dégustation.",
    href:'/tasse-imparfaite#chapitre-6', x:'82%', y:'73%', card:'up-left', mark:'cup',
  },
  {
    id:'decafeination', chapter:'07', title:'Décaféination', kicker:'LE DÉTOUR',
    summary:"Retirer la caféine sans emporter les précurseurs aromatiques : un détour technique au milieu du voyage.",
    href:'/tasse-imparfaite#chapitre-7', x:'49%', y:'76%', card:'up', mark:'drop', detour:true,
  },
]

function JourneyMark({ kind }) {
  const common = {
    fill:'none', stroke:'currentColor', strokeWidth:1.55,
    strokeLinecap:'round', strokeLinejoin:'round',
  }
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true" {...common}>
      {kind === 'leaf' && <>
        <path d="M35 8C23 8 11 14 11 26c0 6 4 10 10 10 12 0 17-14 14-28Z" />
        <path d="M12 34c7-9 13-14 21-19" />
      </>}
      {kind === 'route' && <>
        <circle cx="11" cy="31" r="3" /><circle cx="33" cy="12" r="3" />
        <path d="M14 29c6-2 5-9 11-10s4-5 5-5" />
        <path d="M8 10c4 0 6 2 6 6s-2 6-6 6M36 24c-4 0-6 2-6 6s2 6 6 6" />
      </>}
      {kind === 'process' && <>
        <path d="M10 13h24l-3 21H13L10 13Z" />
        <path d="M15 13V9h14v4M17 23c3-4 7 4 10 0s5 1 5 1" />
        <circle cx="18" cy="29" r="1.7" /><circle cx="26" cy="27" r="1.7" />
      </>}
      {kind === 'molecule' && <>
        <circle cx="11" cy="22" r="4" /><circle cx="30" cy="11" r="4" /><circle cx="32" cy="31" r="4" />
        <path d="M15 20l11-7M15 24l13 5M30 15l1 12" />
      </>}
      {kind === 'defect' && <>
        <path d="M22 7 38 35H6L22 7Z" />
        <path d="M22 17v9M22 31h.01" />
      </>}
      {kind === 'cup' && <>
        <path d="M10 13h21v10a10 10 0 0 1-10 10h-1A10 10 0 0 1 10 23V13Z" />
        <path d="M31 16h3a5 5 0 0 1 0 10h-3M8 36h27" />
        <path d="M16 9c0-2 2-2 2-4M24 9c0-2 2-2 2-4" />
      </>}
      {kind === 'drop' && <>
        <path d="M22 6c7 10 11 16 11 22a11 11 0 0 1-22 0c0-6 4-12 11-22Z" />
        <path d="M17 29c2 3 6 4 9 1" />
      </>}
    </svg>
  )
}

function CoffeeJourney() {
  return (
    <section className="ks-journey" id="ks-journey">
      <div className="ks-shell">
        <header className="ks-journey-head">
          <span className="ks-eyebrow">TASSE IMPARFAITE</span>
          <h2>L&apos;aventure<br />du café<span>.</span></h2>
          <p>
            De la plante à la tasse, avec quelques détours par l&apos;histoire,
            la chimie et les accidents de parcours. Chaque escale ouvre un chapitre du livre.
          </p>
        </header>

        <div className="ks-journey-map" aria-label="Les chapitres de Tasse imparfaite">
          <svg className="ks-journey-route" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
            <path className="ks-journey-route-main" d="M80 196 C150 82 220 82 270 112 S390 245 455 201 S560 80 635 106 S750 225 820 201 C888 178 903 260 870 344 S854 410 820 410" />
            <path className="ks-journey-route-detour" d="M455 201 C466 300 454 360 490 426" />
          </svg>

          {COFFEE_JOURNEY.map(stage => (
            <article
              key={stage.id}
              className={`ks-journey-stop${stage.detour ? ' is-detour' : ''}`}
              style={{ '--jx':stage.x, '--jy':stage.y }}
              data-card={stage.card}
            >
              <a href={stage.href} data-cursor="active" aria-label={`Chapitre ${stage.chapter} — ${stage.title}`}>
                <span className="ks-journey-point">
                  <i>{stage.chapter}</i>
                  <span className="ks-journey-icon"><JourneyMark kind={stage.mark} /></span>
                </span>

                <span className="ks-journey-label">
                  <small>{stage.kicker}</small>
                  <strong>{stage.title}</strong>
                </span>

                <span className="ks-journey-card">
                  <small>CHAPITRE {stage.chapter}</small>
                  <strong>{stage.title}</strong>
                  <span>{stage.summary}</span>
                  <b>LIRE PLUS <i>→</i></b>
                </span>
              </a>
            </article>
          ))}

          <span className="ks-journey-start">DE L&apos;ARBRE</span>
          <span className="ks-journey-end">À LA TASSE</span>
        </div>
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

      <button className="ks-menu-button" onClick={() => scrollTo('ks-journey')}
        data-cursor="active" aria-label="Aller à l'aventure café">
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

      {/* 4 — L'aventure café */}
      <CoffeeJourney />

      {/* 5 — Signature */}
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
