// netlify/lib/builders.mjs
// Un builder par univers. Chacun renvoie un objet JSON prêt à stocker en blob.
// Aucun builder n'invente de donnée : tout vient d'un flux réel.

import { fetchText, fetchJSON, rssItems, strip, frDate, claude } from './http.mjs'

/* ═══════════════════════ ACTUALITÉS ═══════════════════════ */

const NEWS_SOURCES = [
  { url: 'https://perfectdailygrind.com/feed/',  name: 'Perfect Daily Grind', topic: 'actualite',   lang: 'en' },
  { url: 'https://sprudge.com/feed',             name: 'Sprudge',             topic: 'culture',     lang: 'en' },
  { url: 'https://dailycoffeenews.com/feed',     name: 'Daily Coffee News',   topic: 'industrie',   lang: 'en' },
  { url: 'https://www.baristamagazine.com/feed/', name: 'Barista Magazine',   topic: 'barista',     lang: 'en' },
  { url: 'https://sca.coffee/news/rss',          name: 'SCA News',            topic: 'association', lang: 'en' },
]

// Certains flux préfixent chaque résumé d'une mention de leur propre RSS.
const BOILERPLATE = [
  /^This article is from the coffee website Sprudge at \S+\s*/i,
  /^This is the RSS feed version\.\s*/i,
  /\bThe post .{0,120}appeared first on .{0,60}\.\s*$/i,
  /\[\.\.\.\]\s*$/,
]

export function cleanSummary(text) {
  let out = text
  // Deux passes : les deux phrases Sprudge se suivent.
  for (let i = 0; i < 2; i++) for (const rx of BOILERPLATE) out = out.replace(rx, '')
  return out.trim()
}

export async function buildNews() {
  const results = await Promise.allSettled(
    NEWS_SOURCES.map(async (src) => {
      const xml = await fetchText(src.url, { timeout: 10000 })
      return rssItems(xml, 4).map((i) => ({
        source: src.name,
        title: i.title,
        summary: cleanSummary(i.summary).slice(0, 220),
        url: i.url,
        topic: src.topic,
        lang: src.lang,
        date: i.date,
        img: i.img,
      }))
    })
  )

  const news = []
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') news.push(...r.value)
    else console.error('news RSS KO:', NEWS_SOURCES[i].name, r.reason?.message)
  })

  if (news.length < 3) throw new Error(`Actualites : seulement ${news.length} articles recuperes`)
  return { news }
}

/* ═══════════════════════ SCIENCE ═══════════════════════ */

export async function buildScience() {
  const body = await fetchJSON('https://kissa-soko-science.raphimignon.workers.dev', { timeout: 20000 })
  if (!Array.isArray(body?.science) || body.science.length === 0) {
    throw new Error('Worker science : reponse vide')
  }
  return { science: body.science }
}

/* ═══════════════════════ MATÉRIEL ═══════════════════════ */

// trusted : flux entièrement consacré au matériel. Le filtre par mots clés
// est conçu pour trier des magazines généralistes, il n'a rien à faire ici et
// écarterait des tests légitimes dont le titre ne contient aucun mot clé.
const GEAR_SOURCES = [
  { url: 'https://coffeegeek.com/reviews/feed/',                name: 'CoffeeGeek', trusted: true },
  { url: 'https://dailycoffeenews.com/feed/?posts_per_page=50', name: 'Daily Coffee News' },
  { url: 'https://perfectdailygrind.com/feed/',                 name: 'Perfect Daily Grind' },
  { url: 'https://www.baristamagazine.com/feed/',               name: 'Barista Magazine' },
  { url: 'https://sprudge.com/feed',                            name: 'Sprudge' },
]

const GEAR_KW = [
  'new grinder', 'new machine', 'new dripper', 'new brewer', 'new kettle', 'new roaster',
  'launches', 'launch', 'unveils', 'unveil', 'introduces', 'releases', 'new product',
  'now available', 'available now', 'just released', 'new model', 'new version', 'gen 2',
  'v2', 'v3', 'limited edition', 'new design', 'redesigned', 'updated',
  'review', 'test drive', 'hands on', 'first look', 'grinder', 'dripper', 'espresso machine',
  'home roaster', 'pour over', 'kettle', 'scale', 'tamper', 'puck screen', 'filter paper',
  'hario', 'fellow', 'weber', 'timemore', 'comandante', 'normcore', 'orea', 'sibarist', 'kinto',
  'loveramics', 'ikawa', 'aillio', 'decent', 'niche', 'baratza', 'eureka', 'compak', 'mahlkonig',
  'la marzocco', 'rocket', 'lelit', 'flair', 'acaia', 'brewista',
]

const SKIP_KW = [
  'world of coffee', 'coffee expo', 'trade show', 'booth', 'exhibitor', 'convention center',
  'san diego', 'houston', 'milan', 'amsterdam', 'chicago', 'coffee show',
  // Évènements et culture : « since launching » suffisait à faire passer un festival.
  'festival', 'throwdown', 'championship', 'competition', 'barista battle', 'zine',
  'launch party', 'pop-up', 'opens in', 'now open', 'build-outs', 'build outs',
  'hiring', 'acquires', 'acquisition', 'obituary', 'passes away',
]

// Plus d'illustration generique par categorie : une photo Unsplash de latte
// posee sur un test de moulin ne montre pas le produit dont on parle. Sans
// vraie photo, la carte s'affiche sans image, et c'est tres bien.

export async function buildGear() {
  const results = await Promise.allSettled(
    GEAR_SOURCES.map(async (src) => {
      const xml = await fetchText(src.url)
      return rssItems(xml, 50).map((i) => ({ ...i, summary: i.summary.slice(0, 300), source: src.name }))
    })
  )

  const items = []
  const seen = new Set()
  results.forEach((r, idx) => {
    if (r.status !== 'fulfilled') {
      console.error('gear RSS KO:', GEAR_SOURCES[idx].name, r.reason?.message)
      return
    }
    const trusted = GEAR_SOURCES[idx].trusted
    for (const item of r.value) {
      if (seen.has(item.url)) continue
      const text = (item.title + ' ' + item.summary).toLowerCase()
      // Les mots clés matériel se cherchent partout, les rejets uniquement
      // dans le titre : un festival mentionné en passant dans le résumé ne
      // doit pas écarter un test de moulin.
      if (!trusted && !GEAR_KW.some((k) => text.includes(k))) continue
      if (SKIP_KW.some((k) => item.title.toLowerCase().includes(k))) continue
      seen.add(item.url)
      items.push(item)
    }
  })

  // Un seul article suffit. Le seuil à trois datait d'un filtre plus large ;
  // avec le filtre actuel il rejetait des résultats parfaitement valides.
  if (items.length === 0) throw new Error('Materiel : aucun article retenu')

  // Les sources n'ont pas la même cadence : sans tri, un test CoffeeGeek de
  // janvier passerait devant une annonce de la semaine.
  items.sort((a, b) => (b.ts || 0) - (a.ts || 0))
  const shortlist = items.slice(0, 14)

  // Le temps d'un appel à Haiku est dominé par les tokens de sortie. Une
  // requête de quatorze articles dépassait les 25 secondes ; deux lots de
  // sept lancés en parallèle prennent à peu près moitié moins.
  const batches = []
  for (let i = 0; i < shortlist.length; i += 7) batches.push(shortlist.slice(i, i + 7))

  const batchResults = await Promise.allSettled(batches.map((batch) => translateGear(batch)))

  const gear = []
  batchResults.forEach((r, i) => {
    if (r.status === 'fulfilled') gear.push(...r.value)
    else console.error('lot materiel KO:', i, r.reason?.message)
  })

  // Rien de valide : on préfère lever pour conserver le blob précédent
  // plutôt que d'écraser une bonne réponse par une liste vide.
  if (gear.length === 0) throw new Error('Materiel : aucun article exploitable apres relecture')

  gear.sort((a, b) => (b.ts || 0) - (a.ts || 0))
  return { gear }
}

// Traduit et qualifie un lot d'articles. Résumés courts et lot restreint :
// c'est la longueur de la réponse qui fait la latence, pas la question posée.
async function translateGear(batch) {
  const list = batch
    .map((g, i) => [i, g.title, g.summary, g.source, g.date].join('|||'))
    .join('\n')

  const prompt =
    'You are a specialty coffee equipment editor. For each article below, first decide whether it is ' +
    'genuinely about a piece of coffee equipment: a product, a launch, a review or a hands-on. ' +
    'Articles about cafe openings, festivals, competitions, people, business news or culture are NOT ' +
    'equipment articles, even when a machine is mentioned in passing. Set "is_gear":false for those ' +
    'and leave their other fields empty. Then, for the equipment articles only: 1) translate the title ' +
    'to French, 2) write a French summary of 2 or 3 sentences saying what the product is and who it is for, ' +
    '3) determine category (Moulin, Machine, Dripper, Accessories, Tasse, Filtre, Torrefacteur, Tech), ' +
    '4) hot:true if new release/launch, hot:false if review or general news. Be concise. ' +
    'Return ONLY valid JSON array, no markdown, one object per article including the rejected ones:\n' +
    '[{"i":0,"is_gear":true,"title":"titre francais","summary":"2 a 3 phrases","category":"category","hot":true}]\n\n' +
    'Articles:\n' + list

  const translated = await claude(prompt, 1800)
  if (!Array.isArray(translated)) throw new Error('Reponse de traduction inattendue')

  return translated.map((t, idx) => {
    if (t.is_gear === false) return null
    const original = batch[typeof t.i === 'number' ? t.i : idx]
    if (!original) return null
    return {
      title: t.title || original.title,
      summary: t.summary || original.summary,
      category: t.category || 'Tech',
      hot: !!t.hot,
      url: original.url,
      source: original.source,
      date: original.date,
      ts: original.ts || 0,
      img: original.img || null,
    }
  }).filter(Boolean)
}

/* ═══════════════════════ SPRUDGE REPORT ═══════════════════════ */

const AD_DOMAINS = [
  'swisswater.com', 'pacificfoodservice', 'noissue.co', 'lamarzoccousa.com/about',
  'klatchcoffee.com', '8thandroast.com', 'nightswimcoffee.com', 'equatorcoffees.com',
  'labarbacoffee.com', 'joecoffeecompany.com', 'blueprintcoffee.com', 'stumptowncoffee.com',
  'partnerscoffee.com', 'philsebastian.com', 'onyxcoffeelab.com', 'madcapcoffee.com',
  'olympiacoffee.com', 'portlandcoffeeroasters.com', 'mrespresso.com', 'prestacoffee.com',
  'perccoffee.com', 'vervecoffee.com', 'caffeumbria.com',
]

const PROMO_SECTIONS = ["roaster's village", 'coffee gear!', 'roasters village', 'coffee gear']

function parseSprudgeTiles(xml) {
  const tiles = []
  const itemM = xml.match(/<item>([\s\S]*?)<\/item>/)
  if (!itemM) return tiles
  const item = itemM[1]

  const pubDate = frDate((item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '')
  const encoded = (item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/) || [])[1] || ''
  if (!encoded) return tiles

  const h3rx = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|$)/g
  let m
  while ((m = h3rx.exec(encoded)) !== null) {
    const title = strip(m[1])
    const body = m[2]
    if (!title || title.length < 4) continue
    if (PROMO_SECTIONS.some((s) => title.toLowerCase().includes(s))) continue

    const sprudgeLink = (body.match(/href="(https:\/\/sprudge\.com\/[^"]+)"/) || [])[1] || null
    if (!sprudgeLink && AD_DOMAINS.some((d) => body.includes(d))) continue

    const text = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
      .map((p) => strip(p[1]))
      .filter((t) => t.length > 10)
      .join(' ')
      .slice(0, 800)
    if (!text) continue

    const img = (body.match(/src="(https:\/\/substackcdn[^"]+\.(?:jpg|jpeg|png|webp|heic)[^"]*)"/) || [])[1] || null

    tiles.push({
      source: 'The Sprudge Report',
      title,
      summary: text,
      url: sprudgeLink || 'https://sprudge.com',
      date: pubDate,
      img,
    })
  }
  return tiles.slice(0, 10)
}

export async function buildSprudge() {
  const xml = await fetchText('https://sprudge.substack.com/feed', {
    headers: { 'Cache-Control': 'no-cache' },
  })
  const raw = parseSprudgeTiles(xml)
  if (raw.length === 0) throw new Error('Aucune section parsee dans le flux Substack')

  const sections = raw.map((t, i) => [i, t.title, t.summary].join('|||')).join('\n')
  const prompt =
    'Translate these specialty coffee newsletter sections to French. Natural fluid translation. ' +
    'Translate the full text faithfully, do not summarize. Return ONLY valid JSON array, no markdown.\n' +
    'Each object: {"i":0,"title":"french title","summary":"full french text"}\n\nSections:\n' + sections

  let tiles = raw
  try {
    const translated = await claude(prompt, 2500)
    if (Array.isArray(translated)) {
      tiles = raw.map((t, i) => {
        const tr = translated.find((x) => x.i === i)
        return tr ? { ...t, title: tr.title || t.title, summary: tr.summary || t.summary } : t
      })
    }
  } catch (e) {
    // On sert l'anglais plutôt que rien : la traduction est un confort, pas la donnée.
    console.error('Traduction Sprudge KO:', e.message)
  }

  return { tiles }
}

/* ═══════════════════════ ORIGINES ═══════════════════════ */

const HARVEST_URL =
  'https://raw.githubusercontent.com/GaufreGentille/coffee-dashboard/refs/heads/main/coffee-dashboard/coffee-dashboard/src/data/harvest-calendar.json'

export async function buildHarvest() {
  const data = await fetchJSON(HARVEST_URL, { timeout: 15000 })
  if (!Array.isArray(data?.origins)) throw new Error('harvest-calendar.json : champ origins absent')
  return data
}

// Les statuts dépendent de la date du jour : on les calcule à la lecture,
// pas au cron, pour qu'un blob vieux d'une semaine reste juste.
function dateToMonthIndex(date) {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  if (y === 2026) return m
  if (y === 2027 && m <= 6) return 12 + m
  return 6
}

function getOriginStatus(origin, nowIdx) {
  const priority = ['available', 'shipping', 'arriving_soon', 'shipping_soon', 'buying', 'buying_soon', 'harvest']
  const statuses = origin.cycles.map((cycle) => {
    const { available_eu, shipping, buying_window, harvest } = cycle
    if (available_eu?.includes(nowIdx)) return 'available'
    if (shipping?.includes(nowIdx)) return 'shipping'
    if (buying_window?.includes(nowIdx)) return 'buying'
    if (harvest?.includes(nowIdx)) return 'harvest'
    const nearIn = (arr, n = 2) => arr?.some((x) => x > nowIdx && x - nowIdx <= n)
    if (nearIn(available_eu)) return 'arriving_soon'
    if (nearIn(shipping)) return 'shipping_soon'
    if (nearIn(buying_window)) return 'buying_soon'
    return null
  }).filter(Boolean)

  if (!statuses.length) return 'off_season'
  for (const p of priority) if (statuses.includes(p)) return p
  return statuses[0]
}

export function enrichHarvest(data) {
  const now = new Date()
  const nowIdx = dateToMonthIndex(now)
  return {
    ...data,
    _live: {
      today: now.toISOString().split('T')[0],
      month_index: nowIdx,
      computed_at: now.toISOString(),
    },
    origins: data.origins.map((origin) => ({ ...origin, _status: getOriginStatus(origin, nowIdx) })),
  }
}
