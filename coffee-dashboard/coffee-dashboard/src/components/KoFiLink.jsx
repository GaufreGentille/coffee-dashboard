// Point d'entrée unique vers le soutien Ko-fi de Kissa Soko.
export const KOFI_TIP_URL = 'https://ko-fi.com/gaufregentille/donate'

export default function KoFiLink() {
  return (
    <a
      className="ks-kofi-link"
      href={KOFI_TIP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Offrir un café dans le Kissaten (ouvre Ko-fi dans un nouvel onglet)"
      title="Un café pour le Kissaten ?"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M4 8h14v5a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6V8Z" />
        <path d="M18 9h2a2 2 0 0 1 0 4h-2" />
        <path d="M7 3v2m5-2v2m5-2v2" />
      </svg>
      <span className="ks-kofi-label">Offrir un café</span>
    </a>
  )
}
