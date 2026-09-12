/* ─────────────────────────────────────────────────────────────
   Tasse imparfaite — source unique de vérité

   Sept chapitres et six annexes, dans l'ordre du manuscrit.
   Tout ce qui parle du livre lit ce fichier : la carte de
   l'aventure café, le menu du site, et plus tard le sommaire.

   Sur la carte, chaque annexe est un satellite accroché à son
   chapitre : l'eau pend à l'extraction, le koji aux process, la
   roue des arômes à la chimie. Un trait pointillé fait la liaison.

   ready:false  = la page HTML n'existe pas encore. L'entrée
                  s'affiche, mais sans lien mort. Les six annexes sont
                  passées à true : build-tasse-imparfaite.py les génère.

   Les positions x/y sont en pourcentage de la carte. Elles ont été
   calées pour que ni les points, ni les libellés, ni les repères de
   route ne se chevauchent : si tu en déplaces un, vérifie ses
   voisins.
   ───────────────────────────────────────────────────────────── */

export const BOOK_BASE = '/tasse-imparfaite'

export const bookHref = entry => `${BOOK_BASE}/${entry.file}`

export const BOOK_CHAPTERS = [
  {
    kind: 'chapter',
    id: 'taxonomie', n: '01', title: 'Taxonomie', kicker: 'LE VIVANT',
    file: 'chapitre-1.html', ready: true,
    summary: "Morphologie et écologie d'arabica et de canephora, classification génétique des groupes, puis le catalogue des variétés.",
    topics: ['Morphologie et écologie', 'Groupes génétiques (RD2 Vision, WCR)', 'Variétés Arabica : Typica, Bourbon, landraces', 'Introgressés et hybrides F1', 'Variétés Canephora'],
    x: '8%', y: '30%', card: 'down', mark: 'leaf',
  },
  {
    kind: 'chapter',
    id: 'histoire', n: '02', title: 'Histoire', kicker: 'LES ROUTES',
    file: 'chapitre-2.html', ready: true,
    summary: "Les origines biologiques de Coffea arabica, les centres de domestication, l'amélioration génétique, puis la diffusion mondiale et la construction de la filière.",
    topics: ['Hybridation et domestication', 'Diversité génétique', 'Amélioration variétale', 'Routes commerciales et filière'],
    x: '25%', y: '15%', card: 'down', mark: 'route',
  },
  {
    kind: 'chapter',
    id: 'process', n: '03', title: 'Process', kicker: 'LA TRANSFORMATION',
    file: 'chapitre-3.html', ready: true,
    summary: "Le plus gros chapitre du livre : lavé, semi-lavé, nature, honey, pulped natural, et toutes les fermentations contemporaines.",
    topics: ['Lavé, semi-lavé, nature', 'Honey et pulped natural', 'Anaérobie et macération carbonique', 'Lactique, levures, co-fermentation', 'Gilling basah, thermal shock'],
    x: '44%', y: '31%', card: 'down', mark: 'process',
  },
  {
    kind: 'chapter',
    id: 'chimie', n: '04', title: 'Chimie aromatique', kicker: 'LES MOLÉCULES',
    file: 'chapitre-4.html', ready: true,
    summary: "Les familles de molécules, leurs signatures en tasse, leur comportement à la torréfaction et ce que cette lecture permet à l'atelier.",
    topics: ['Familles de molécules', 'Signatures aromatiques', 'Comportement à la torréfaction'],
    x: '63%', y: '14%', card: 'down', mark: 'molecule',
  },
  {
    kind: 'chapter',
    id: 'defauts', n: '05', title: 'Défauts', kicker: 'LES ACCIDENTS',
    file: 'chapitre-5.html', ready: true,
    summary: "Quatre familles de causes, du fruit jusqu'au stockage, et la façon de remonter d'une tasse au problème qui l'a produite.",
    topics: ['Fermentation et eau', 'Vieillissement et stockage', 'Maturité et récolte', 'Contaminations et environnements'],
    x: '82%', y: '31%', card: 'left', mark: 'defect',
  },
  {
    kind: 'chapter',
    id: 'extraction', n: '06', title: 'Extraction', kicker: 'LA TASSE',
    file: 'chapitre-6.html', ready: true,
    summary: "Les six variables d'extraction, les données de référence, les méthodes filtre et l'espresso, puis tout ce qui tourne autour du poste.",
    topics: ['Les 6 variables', 'Défauts de tasse', 'Méthodes filtre et extracteurs', 'Outils du barista espresso', 'Le lait, HACCP, maintenance'],
    x: '82%', y: '69%', card: 'up-left', mark: 'cup',
  },
  {
    kind: 'chapter',
    id: 'decafeination', n: '07', title: 'Décaféination', kicker: 'LE DÉTOUR',
    file: 'chapitre-7.html', ready: true, detour: true,
    summary: "Retirer une seule molécule sans emporter les précurseurs aromatiques : procédés, réglementation, lecture d'étiquette et torréfaction d'un décaféiné.",
    topics: ['La caféine dans le grain', 'Cadre réglementaire', 'Solvants, eau, CO₂ supercritique', 'Torréfier un décaféiné'],
    x: '49%', y: '72%', card: 'up', mark: 'drop',
  },
]

export const BOOK_ANNEXES = [
  {
    kind: 'annexe', parent: 'chimie',
    id: 'annexe-a', n: 'A', title: 'Composés volatils', kicker: 'ANNEXE A',
    file: 'annexe-a.html', ready: true,
    line: 'Les principaux composés volatils du café torréfié, famille par famille.',
    x: '76%', y: '5%', card: 'down', mark: 'vapor',
  },
  {
    kind: 'annexe', parent: 'defauts',
    id: 'annexe-b', n: 'B', title: 'Acrylamide', kicker: 'ANNEXE B',
    file: 'annexe-b.html', ready: true,
    line: 'Cinétique de formation au cours de la torréfaction.',
    x: '68%', y: '39%', card: 'down', mark: 'flask',
  },
  {
    kind: 'annexe', parent: 'extraction',
    id: 'annexe-c', n: 'C', title: "L'eau dans le café", kicker: 'ANNEXE C',
    file: 'annexe-c.html', ready: true,
    line: 'Minéralisation, pH, normes SCA, fabriquer son eau, comparatif des eaux du commerce.',
    x: '69%', y: '76%', card: 'up', mark: 'wave',
  },
  {
    kind: 'annexe', parent: 'process',
    id: 'annexe-d', n: 'D', title: 'Fermentation Koji', kicker: 'ANNEXE D',
    file: 'annexe-d.html', ready: true,
    line: "Culture d'Aspergillus oryzae et protocoles ASP1.1, ASP1.2, ASP2.2.",
    x: '32%', y: '51%', card: 'down', mark: 'microbe',
  },
  {
    kind: 'annexe', parent: 'chimie',
    id: 'annexe-e', n: 'E', title: 'Roue des arômes', kicker: 'ANNEXE E',
    file: 'annexe-e.html', ready: true,
    line: 'La roue des arômes du livre, pensée pour la dégustation en production.',
    x: '51%', y: '6%', card: 'down', mark: 'wheel',
  },
  {
    kind: 'annexe', parent: 'histoire',
    id: 'annexe-f', n: 'F', title: 'Spécialité 2026', kicker: 'ANNEXE F',
    file: 'annexe-f.html', ready: true,
    line: 'Le café de spécialité existe-t-il encore ? Un texte de position.',
    x: '20%', y: '45%', card: 'down', mark: 'flag',
  },
]

/* Ordre de lecture : chaque chapitre, puis les annexes qui lui sont
   accrochées. C'est cet ordre que le téléphone déroule. */
export const JOURNEY_STOPS = BOOK_CHAPTERS.flatMap(chapter => [
  chapter,
  ...BOOK_ANNEXES.filter(a => a.parent === chapter.id),
])

/* Traits de liaison, en coordonnées du viewBox de la route
   (1000 x 560, preserveAspectRatio="none"). */
const pct = value => parseFloat(value)

export const JOURNEY_LINKS = BOOK_ANNEXES.map(annexe => {
  const parent = BOOK_CHAPTERS.find(c => c.id === annexe.parent)
  if (!parent) return null
  return {
    id: annexe.id,
    x1: pct(parent.x) * 10, y1: pct(parent.y) * 5.6,
    x2: pct(annexe.x) * 10, y2: pct(annexe.y) * 5.6,
  }
}).filter(Boolean)
