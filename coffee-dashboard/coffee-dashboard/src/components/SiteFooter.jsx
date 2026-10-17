import { KOFI_TIP_URL } from './KoFiLink'

export default function SiteFooter() {
  return (
    <footer className="ks-legal-footer">
      <div className="ks-shell ks-legal-footer-inner">
        <div className="ks-legal-footer-brand">
          <span>GG<span>.</span></span>
          <p>Kissa Soko · le café sous toutes ses formes.</p>
        </div>
        <nav aria-label="Informations et soutien">
          <a href="/mentions-legales.html">Mentions légales</a>
          <a href="/confidentialite.html">Confidentialité</a>
          <a href="/conditions-communaute.html">Le Kissaten</a>
          <a href="/credits.html">Crédits</a>
          <a href="/contact.html">Contact</a>
          <a href={KOFI_TIP_URL} target="_blank" rel="noopener noreferrer">Offrir un café</a>
        </nav>
        <small>© 2026 Kissa Soko</small>
      </div>
    </footer>
  )
}
