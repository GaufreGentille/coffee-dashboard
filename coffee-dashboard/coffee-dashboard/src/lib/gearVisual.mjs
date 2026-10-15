// Illustrations éditoriales de Matériel : catégorisation par produit, jamais
// par méthode d'extraction mentionnée accessoirement dans une description RSS.
// Les titres priment ; résumé et catégorie ne servent qu'en repli.
const normalize = value => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[\u2010-\u2015]/g, '-')

const VISUALS = Object.freeze({
  manual: '/materiel-moulin-manuel.png',
  electric: '/materiel-moulin-electrique.png',
  auto: '/materiel-machine-auto.png',
  espresso: '/materiel-espresso.png',
  prosumer: '/materiel-espresso-prosumer.png',
  dripper: '/materiel-dripper.png',
  kettle: '/materiel-bouilloire.png',
  accessories: '/materiel-accessoires.png'
})

// Reconnaissance spécifique de modèles : un nom de machine n'est pas pris
// pour un moulin parce que son résumé mentionne un broyeur intégré.
function categoryFromTitle(value) {
  const t = normalize(value)
  if (!t) return null

  if (/\b(bouilloire|gooseneck|kettle|col de cygne|pitcher)\b/.test(t)) return 'kettle'
  if (/\b(dripper|v60|v-60|kalita|origami|chemex|aeropress|pourover|pour.over|filter brewer)\b/.test(t)) return 'dripper'

  if (/\b(jura|ninja luxe|delonghi|de'longhi|bean.to.cup|superautomatic|super.automatic|super automatique|machine automatique|cafetiere automatique)\b/.test(t)) return 'auto'
  if (/\b(e61|rocket|profitec|ecm synchronika|lelit bianca|la marzocco|rancilio silvia pro|dual boiler)\b/.test(t)) return 'prosumer'
  if (/\b(flair|breville|sage barista|gaggia|la pavoni|espresso machine|machine a espresso|machine espresso|machine a levier|lever espresso|machine a cafe)\b/.test(t)) return 'espresso'

  if (/\b(kingrinder|1zpresso|kinu|aergrind|comandante|porlex|timemore c2|timemore c3|q-air|x-ultra|hand grinder|manual grinder|moulin manuel|moulin a main|broyeur manuel)\b/.test(t)) return 'manual'
  if (/\b(lagom|option-o|niche zero|df64|df83|mahlkonig|mazzer|fellow ode|f74 navigator|mhw-3bomber f74|electric grinder|grinder electrique|moulin electrique|broyeur electrique)\b/.test(t)) return 'electric'

  // En dehors des modèles connus, reconnaître l'objet nommé dans le titre.
  if (/\b(moulin|grinder|broyeur)\b/.test(t)) {
    return /\b(manuel|manual|hand|main|manivelle)\b/.test(t) ? 'manual' : 'electric'
  }
  if (/\b(machine|espresso|expresso|cafetière|cafetiere)\b/.test(t)) {
    return /\b(automatique|automatic|bean.to.cup)\b/.test(t) ? 'auto' : 'espresso'
  }
  if (/\b(tamper|balance|tasse|cup|accessoire|outil|portefiltre|porte-filtre|knock box)\b/.test(t)) return 'accessories'
  return null
}

export function gearVisualCategory(item = {}) {
  const titleResult = categoryFromTitle(item.title || item.name)
  if (titleResult) return titleResult

  const label = categoryFromTitle(item.category)
  if (label) return label

  // Les descriptifs peuvent évoquer plusieurs usages ; ils ne doivent jamais
  // écraser une catégorie trouvée dans le titre.
  const d = normalize(item.summary || item.description)
  if (/\b(machine automatique|bean.to.cup|superautomatic)\b/.test(d)) return 'auto'
  if (/\b(moulin manuel|hand grinder|manual grinder)\b/.test(d)) return 'manual'
  if (/\b(moulin electrique|electric grinder)\b/.test(d)) return 'electric'
  if (/\b(machine espresso|machine a espresso|machine a levier)\b/.test(d)) return 'espresso'
  if (/\b(dripper|v60|chemex|pourover|pour.over)\b/.test(d)) return 'dripper'
  if (/\b(bouilloire|gooseneck|kettle)\b/.test(d)) return 'kettle'
  return 'accessories'
}

export function gearVisual(item) {
  return VISUALS[gearVisualCategory(item)] || VISUALS.accessories
}
