import { useEffect, useRef } from 'react'
import { BOOK_BASE, BOOK_CHAPTERS, bookHref } from '../data/book'

/* ─────────────────────────────────────────────────────────────
   SiteMenu — le menu du bouton rond

   Un seul menu pour tout le site : l'accueil et les pages
   intérieures ouvrent le même panneau. Il lit TABS (passé par
   App) pour les univers et BOOK_CHAPTERS pour le livre, donc
   rien à maintenir en double.

   Fermeture : croix, Échap, clic sur le fond. Le défilement de
   la page est bloqué pendant l'ouverture.
   ───────────────────────────────────────────────────────────── */

const TOOLS = [
  {
    label: 'Outil de cupping',
    note: 'Fiches SCA, radar, export',
    href: 'https://cupping-secure.netlify.app',
  },
  {
    label: 'Mame Mame Roast',
    note: 'Roguelike de torréfaction',
    href: 'https://kissasoko.netlify.app/hangar-torref-843/',
  },
]

export default function SiteMenu({ open, onClose, onNavigate, tabs = [] }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') onClose() }
    const previous = document.body.style.overflow
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  const universes = tabs.filter(t => t.id !== 'home')
  const go = id => { onNavigate(id); onClose() }

  return (
    <div className="ks-menu" id="ks-site-menu" role="dialog" aria-modal="true" aria-label="Menu du site">
      <button className="ks-menu-scrim" onClick={onClose} aria-label="Fermer le menu" tabIndex={-1} />

      <div className="ks-menu-panel">
        <div className="ks-menu-bar">
          <span>MENU</span>
          <button ref={closeRef} className="ks-menu-close" onClick={onClose} aria-label="Fermer le menu">
            <i />
            <i />
          </button>
        </div>

        <div className="ks-menu-scroll">
          <nav className="ks-menu-group" aria-label="Les univers du site">
            <h2>Le site</h2>
            <ul>
              {universes.map(t => (
                <li key={t.id}>
                  <button onClick={() => go(t.id)}>
                    <span>{t.label}</span>
                    <b>{t.href ? '↗' : '→'}</b>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="ks-menu-group" aria-label="Les chapitres de Tasse imparfaite">
            <h2>Le livre</h2>
            <a className="ks-menu-book-index" href={`${BOOK_BASE}/index.html`}>
              Tasse imparfaite, le sommaire <b>→</b>
            </a>
            <ul>
              {BOOK_CHAPTERS.map(c => (
                <li key={c.id}>
                  {c.ready ? (
                    <a href={bookHref(c)}>
                      <i>{c.n}</i>
                      <span>{c.title}</span>
                      <b>→</b>
                    </a>
                  ) : (
                    <div className="is-pending">
                      <i>{c.n}</i>
                      <span>{c.title}</span>
                      <em>À VENIR</em>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <nav className="ks-menu-group" aria-label="Les outils">
            <h2>Les outils</h2>
            <ul>
              {TOOLS.map(tool => (
                <li key={tool.href}>
                  <a href={tool.href} target="_blank" rel="noopener noreferrer">
                    <span>{tool.label}<small>{tool.note}</small></span>
                    <b>↗</b>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="ks-menu-sign">KISSA SOKO · GAUFREGENTILLE</p>
      </div>
    </div>
  )
}
