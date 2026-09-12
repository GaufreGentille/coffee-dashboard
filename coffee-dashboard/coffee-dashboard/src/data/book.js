/* ─────────────────────────────────────────────────────────────
   Tasse imparfaite — source unique de vérité

   Cette liste suit le sommaire réel du manuscrit : sept chapitres
   et six annexes. Tout ce qui parle du livre (la carte de l'aventure
   café sur l'accueil, le menu du site, plus tard un sommaire) lit ce
   fichier. Un titre se corrige ici, il se corrige partout.

   ready:false  = la page HTML n'est pas encore générée. L'entrée
                  s'affiche, mais sans lien mort : passer à true dès
                  que le fichier existe dans public/tasse-imparfaite.
   ───────────────────────────────────────────────────────────── */

export const BOOK_BASE = '/tasse-imparfaite'

export const bookHref = entry => `${BOOK_BASE}/${entry.file}`

export const BOOK_CHAPTERS = [
  {
    id: 'taxonomie', n: '01', title: 'Taxonomie', kicker: 'LE VIVANT',
    file: 'chapitre-1.html', ready: true,
    summary: "Morphologie et écologie d'arabica et de canephora, classification génétique des groupes, puis le catalogue des variétés.",
    topics: ['Morphologie et écologie', 'Groupes génétiques (RD2 Vision, WCR)', 'Variétés Arabica : Typica, Bourbon, landraces', 'Introgressés et hybrides F1', 'Variétés Canephora'],
    x: '8%', y: '30%', card: 'down', mark: 'leaf',
  },
  {
    id: 'histoire', n: '02', title: 'Histoire', kicker: 'LES ROUTES',
    file: 'chapitre-2.html', ready: true,
    summary: "Les origines biologiques de Coffea arabica, les centres de domestication, l'amélioration génétique, puis la diffusion mondiale et la construction de la filière.",
    topics: ['Hybridation et domestication', 'Diversité génétique', 'Amélioration variétale', 'Routes commerciales et filière'],
    x: '25%', y: '15%', card: 'down', mark: 'route',
  },
  {
    id: 'process', n: '03', title: 'Process', kicker: 'LA TRANSFORMATION',
    file: 'chapitre-3.html', ready: true,
    summary: "Le plus gros chapitre du livre : lavé, semi-lavé, nature, honey, pulped natural, et toutes les fermentations contemporaines.",
    topics: ['Lavé, semi-lavé, nature', 'Honey et pulped natural', 'Anaérobie et macération carbonique', 'Lactique, levures, co-fermentation', 'Gilling basah, thermal shock'],
    x: '44%', y: '31%', card: 'down', mark: 'process',
  },
  {
    id: 'chimie', n: '04', title: 'Chimie aromatique', kicker: 'LES MOLÉCULES',
    file: 'chapitre-4.html', ready: true,
    summary: "Les familles de molécules, leurs signatures en tasse, leur comportement à la torréfaction et ce que cette lecture permet à l'atelier.",
    topics: ['Familles de molécules', 'Signatures aromatiques', 'Comportement à la torréfaction'],
    x: '63%', y: '14%', card: 'down', mark: 'molecule',
  },
  {
    id: 'defauts', n: '05', title: 'Défauts', kicker: 'LES ACCIDENTS',
    file: 'chapitre-5.html', ready: true,
    summary: "Quatre familles de causes, du fruit jusqu'au stockage, et la façon de remonter d'une tasse au problème qui l'a produite.",
    topics: ['Fermentation et eau', 'Vieillissement et stockage', 'Maturité et récolte', 'Contaminations et environnements'],
    x: '82%', y: '31%', card: 'left', mark: 'defect',
  },
  {
    id: 'extraction', n: '06', title: 'Extraction', kicker: 'LA TASSE',
    file: 'chapitre-6.html', ready: true,
    summary: "Les six variables d'extraction, les données de référence, les méthodes filtre et l'espresso, puis tout ce qui tourne autour du poste.",
    topics: ['Les 6 variables', 'Défauts de tasse', 'Méthodes filtre et extracteurs', 'Outils du barista espresso', 'Le lait, HACCP, maintenance'],
    x: '82%', y: '69%', card: 'up-left', mark: 'cup',
  },
  {
    id: 'decafeination', n: '07', title: 'Décaféination', kicker: 'LE DÉTOUR',
    file: 'chapitre-7.html', ready: true, detour: true,
    summary: "Retirer une seule molécule sans emporter les précurseurs aromatiques : procédés, réglementation, lecture d'étiquette et torréfaction d'un décaféiné.",
    topics: ['La caféine dans le grain', 'Cadre réglementaire', 'Solvants, eau, CO₂ supercritique', 'Torréfier un décaféiné'],
    x: '49%', y: '72%', card: 'up', mark: 'drop',
  },
]

export const BOOK_ANNEXES = [
  {
    id: 'annexe-a', n: 'A', title: 'Composés volatils',
    file: 'annexe-a.html', ready: false,
    line: 'Les principaux composés volatils identifiés dans le café torréfié.',
  },
  {
    id: 'annexe-b', n: 'B', title: 'Acrylamide',
    file: 'annexe-b.html', ready: false,
    line: 'Cinétique de formation au cours de la torréfaction.',
  },
  {
    id: 'annexe-c', n: 'C', title: "L'eau dans le café",
    file: 'annexe-c.html', ready: false,
    line: 'Minéralisation, pH, normes SCA, fabriquer son eau, comparatif des eaux du commerce.',
  },
  {
    id: 'annexe-d', n: 'D', title: 'Fermentation Koji',
    file: 'annexe-d.html', ready: false,
    line: "Culture d'Aspergillus oryzae et protocoles ASP1.1, ASP1.2, ASP2.2.",
  },
  {
    id: 'annexe-e', n: 'E', title: 'Roue des arômes',
    file: 'annexe-e.html', ready: false,
    line: 'La roue des arômes du livre, pensée pour la dégustation en production.',
  },
  {
    id: 'annexe-f', n: 'F', title: 'Le café de spécialité existe-t-il encore ?',
    file: 'annexe-f.html', ready: false,
    line: 'Un texte de position sur ce que veut dire « spécialité » en 2026.',
  },
]
