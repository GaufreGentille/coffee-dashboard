// csp-report.mjs : reçoit les signalements de la Content-Security-Policy
// (mode observation) et les écrit dans les logs Netlify de cette fonction.
// Chaque ligne « CSP » dit quelle règle aurait bloqué quoi, et sur quelle page.
//
// Rien n'est stocké. Les adresses sont tronquées avant le « ? » pour ne jamais
// écrire de jeton (?jeton=...) dans les logs.

// Le mini jeu charge React, Babel et Tailwind depuis des CDN : il a ses propres
// besoins, ses signalements noieraient le reste.
const IGNORES = [/^\/hangar-torref-843\//]

const sansRequete = (u) => {
  if (typeof u !== 'string') return ''
  try {
    const url = new URL(u)
    return url.origin + url.pathname
  } catch {
    return u.split('?')[0].slice(0, 200)
  }
}

export default async (req) => {
  if (req.method !== 'POST') return new Response(null, { status: 405 })
  const texte = await req.text()
  if (texte.length > 20_000) return new Response(null, { status: 413 })

  let rapports = []
  try {
    const corps = JSON.parse(texte)
    // Ancien format (report-uri) : { "csp-report": {...} }
    // Nouveau format (Reporting API) : [{ type: "csp-violation", body: {...} }]
    rapports = Array.isArray(corps)
      ? corps.filter((r) => r?.type === 'csp-violation').map((r) => r.body || {})
      : [corps?.['csp-report'] || {}]
  } catch {
    return new Response(null, { status: 400 })
  }

  for (const r of rapports.slice(0, 10)) {
    const page = sansRequete(r['document-uri'] || r.documentURL)
    let chemin = ''
    try { chemin = new URL(page).pathname } catch { /* adresse illisible */ }
    if (IGNORES.some((rx) => rx.test(chemin))) continue
    console.log('CSP', JSON.stringify({
      regle: r['effective-directive'] || r.effectiveDirective || r['violated-directive'],
      bloque: sansRequete(r['blocked-uri'] || r.blockedURL) || r['blocked-uri'] || r.blockedURL,
      page,
      source: sansRequete(r['source-file'] || r.sourceFile),
      ligne: r['line-number'] ?? r.lineNumber ?? null,
    }))
  }
  return new Response(null, { status: 204 })
}
