export default function SiteFooter() {
  return (
    <footer className="ks-legal-footer">
      <div className="ks-shell ks-legal-footer-inner">
        <div className="ks-legal-footer-brand">
          <span>GG<span>.</span></span>
          <p>Kissa Soko · le café sous toutes ses formes.</p>
        </div>
        <nav aria-label="Informations légales">
          <a href="/mentions-legales.html">Mentions légales</a>
          <a href="/confidentialite.html">Confidentialité</a>
          <a href="/credits.html">Crédits</a>
          <a href="/contact.html">Contact</a>
        </nav>
        <small>© 2026 Kissa Soko</small>
      </div>
    </footer>
  )
}
