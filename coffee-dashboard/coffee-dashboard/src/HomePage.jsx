import { useState, useEffect, useRef } from 'react'
import { BOOK_BASE, JOURNEY_STOPS, JOURNEY_LINKS, bookHref } from './data/book'

/* ─────────────────────────────────────────────────────────────
   HomePage — vitrine Kissa Soko

   Quatre temps : l'ouverture (qui parle), la transformation
   (cerise vers grain vert), la preuve de vie (« En ce moment »,
   données réelles des flux) et l'aventure café (les chapitres
   du livre). La navigation complète vit dans le menu du bouton
   rond, rendu par App.

   Le curseur maison est rendu par App, pas ici.
   ───────────────────────────────────────────────────────────── */

const GG_ORANGE = '#da5d16'

/* Index de mois aligné sur HarvestPanel : 1 à 12 pour l'année de
   référence du flux récoltes, 13 à 18 pour le premier semestre
   suivant. L'année n'est plus écrite en dur : si le flux expose sa
   propre année de référence, c'est elle qui gagne. Sans cela, on
   retombe sur BASE_YEAR, qu'il faut suivre à la main. */
const BASE_YEAR = 2026

function monthIndex(date = new Date(), baseYear = BASE_YEAR) {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  if (y === baseYear) return m
  if (y === baseYear + 1 && m <= 6) return 12 + m
  return null
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
  const nowIdx = monthIndex(new Date(), harvest?.data?.baseYear)
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
              <dd className="ks-live-action">
                <button onClick={() => setTab('harvest')} data-cursor="active">Voir le calendrier</button>
              </dd>
            </div>
            <div>
              <dt>Veille scientifique</dt>
              <dd>PubMed<i>NCBI</i></dd>
              <dd className="ks-live-action">
                <button onClick={() => setTab('science')} data-cursor="active">Derniers papiers</button>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

/* ── L'aventure café : les chapitres de Tasse imparfaite ─────
   Les escales, leurs titres et leurs positions viennent de
   data/book.js, qui suit le sommaire réel du manuscrit. */

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
      {kind === 'vapor' && <>
        <path d="M15 36c-3-4-1-7 1-9s3-5 0-8 0-6 1-7" />
        <path d="M23 36c-3-4-1-7 1-9s3-5 0-8 0-6 1-7" />
        <path d="M31 34c-2-3-1-6 1-8s2-4 0-6" />
      </>}
      {kind === 'flask' && <>
        <path d="M18 8h8v9l8 15a3 3 0 0 1-3 4H13a3 3 0 0 1-3-4l8-15V8Z" />
        <path d="M17 6h10M15 27h14" />
      </>}
      {kind === 'wave' && <>
        <path d="M7 16c4-4 8 4 12 0s8-4 12 0" />
        <path d="M7 24c4-4 8 4 12 0s8-4 12 0" />
        <path d="M7 32c4-4 8 4 12 0s8-4 12 0" />
      </>}
      {kind === 'microbe' && <>
        <circle cx="22" cy="22" r="11" />
        <path d="M22 11V6M33 22h5M22 33v5M11 22H6" />
        <circle cx="18" cy="19" r="1.8" /><circle cx="26" cy="24" r="1.8" />
      </>}
      {kind === 'wheel' && <>
        <circle cx="22" cy="22" r="13" /><circle cx="22" cy="22" r="4.5" />
        <path d="M22 9v8.5M22 26.5V35M9 22h8.5M26.5 22H35M13 13l6 6M25 25l6 6M31 13l-6 6M19 25l-6 6" />
      </>}
      {kind === 'flag' && <>
        <path d="M13 7v30" />
        <path d="M13 9h17l-3.5 6.5L30 22H13Z" />
      </>}
    </svg>
  )
}

function JourneyStop({ stage }) {
  const isAnnexe = stage.kind === 'annexe'

  const inner = <>
    <span className="ks-journey-point">
      <i>{stage.n}</i>
      <span className="ks-journey-icon"><JourneyMark kind={stage.mark} /></span>
    </span>

    <span className="ks-journey-label">
      <small>{stage.kicker}</small>
      <strong>{stage.title}</strong>
    </span>

    <span className="ks-journey-card">
      <small>{isAnnexe ? stage.kicker : `CHAPITRE ${stage.n}`}</small>
      <strong>{stage.title}</strong>
      <span>{isAnnexe ? stage.line : stage.summary}</span>
      {stage.topics?.length > 0 && (
        <span className="ks-journey-topics">
          {stage.topics.map(t => <i key={t}>{t}</i>)}
        </span>
      )}
      <b>{stage.ready ? <>LIRE PLUS <i>→</i></> : <>À VENIR</>}</b>
    </span>
  </>

  const className = [
    'ks-journey-stop',
    stage.detour ? 'is-detour' : '',
    isAnnexe ? 'is-annexe' : '',
    stage.ready ? '' : 'is-pending',
  ].filter(Boolean).join(' ')

  const label = isAnnexe
    ? `${stage.kicker} : ${stage.title}`
    : `Chapitre ${stage.n} : ${stage.title}`

  return (
    <article
      className={className}
      style={{ '--jx':stage.x, '--jy':stage.y }}
      data-card={stage.card}
    >
      {stage.ready
        ? <a href={bookHref(stage)} data-cursor="active" aria-label={label}>{inner}</a>
        : <div aria-label={`${label}, à venir`}>{inner}</div>}
    </article>
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
            la chimie et les accidents de parcours. Sept escales, une par chapitre,
            et six annexes accrochées au chapitre qu&apos;elles prolongent.
          </p>
          <a className="ks-journey-index" href={`${BOOK_BASE}/index.html`} data-cursor="active">
            VOIR LE SOMMAIRE <b>→</b>
          </a>
        </header>

        <div className="ks-journey-map" aria-label="Les chapitres et les annexes de Tasse imparfaite">
          <svg className="ks-journey-route" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
            <path className="ks-journey-route-main" d="M80 170 C150 56 220 56 270 86 S390 219 455 175 S560 54 635 80 S750 199 820 175 C888 152 903 234 870 318 S854 384 820 384" />
            <path className="ks-journey-route-detour" d="M455 175 C466 274 454 334 490 400" />
            {JOURNEY_LINKS.map(link => (
              <line
                key={link.id}
                className="ks-journey-link"
                x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2}
              />
            ))}
          </svg>

          {JOURNEY_STOPS.map(stage => <JourneyStop key={stage.id} stage={stage} />)}

          <span className="ks-journey-start">DE L&apos;ARBRE</span>
          <span className="ks-journey-end">À LA TASSE</span>
        </div>
      </div>
    </section>
  )
}

/* ── Page ───────────────────────────────────────────────────── */

export default function HomePage({
  setTab, onNavigate, onMenu, menuOpen = false,
  navTabs = [],
  news, markets, harvest,
}) {
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 88)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

      <button
        className={`ks-menu-button${menuOpen ? ' is-open' : ''}`}
        onClick={onMenu}
        data-cursor="active"
        aria-controls="ks-site-menu"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
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
