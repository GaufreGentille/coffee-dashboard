const https = require('https')

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

let cache = null
let cacheTime = 0
const CACHE_TTL = 12 * 60 * 60 * 1000

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url)
    const req = https.request({
      hostname: opts.hostname,
      path: opts.pathname + opts.search,
      method: 'GET',
      headers: {
        'User-Agent': 'KissaSoko/1.0',
        'Accept': 'application/json',
      }
    }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }) }
        catch(e) { resolve({ status: res.statusCode, body: {} }) }
      })
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.end()
  })
}

const FIELD_MAP = [
  { keywords: ['ferment','anaerob','microb','yeast','lactic','acetic'],     field:'Fermentation',  emoji:'🧪' },
  { keywords: ['genomic','crispr','breed','genetic','drought','resilience'], field:'Génomique',     emoji:'🍃' },
  { keywords: ['roast','maillard','pyrazine','melanoidin','thermal'],        field:'Torréfaction',  emoji:'🔥' },
  { keywords: ['chlorogenic','polyphenol','antioxidant','bioavailab'],       field:'Biochimie',     emoji:'⚛️' },
  { keywords: ['sensory','cupping','flavor','aroma','volatile','consumer'],  field:'Sensoriel',     emoji:'👃' },
  { keywords: ['agronomy','yield','soil','shade','climate','production'],    field:'Agronomie',     emoji:'🌱' },
]

function classifyPaper(title, abstract) {
  const text = (title + ' ' + (abstract || '')).toLowerCase()
  for (const { keywords, field, emoji } of FIELD_MAP) {
    if (keywords.some(k => text.includes(k))) return { field, emoji }
  }
  return { field: 'Recherche', emoji: '🔬' }
}

async function searchS2(query, limit) {
  const fields = 'title,abstract,year,publicationDate,journal,externalIds,openAccessPdf'
  const url = 'https://api.semanticscholar.org/graph/v1/paper/search?query='
    + encodeURIComponent(query)
    + '&fields=' + fields
    + '&limit=' + (limit || 10)
  const { status, body } = await httpsGet(url)
  if (status !== 200) throw new Error('S2 status ' + status)
  return (body.data || []).filter(p => p.title && p.abstract && p.year >= 2022)
}

function formatPaper(p) {
  const doi = p.externalIds?.DOI
  const url = doi
    ? 'https://doi.org/' + doi
    : (p.openAccessPdf?.url || 'https://www.semanticscholar.org/paper/' + p.paperId)
  const dateStr = p.publicationDate
    ? new Date(p.publicationDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    : String(p.year)
  const { field, emoji } = classifyPaper(p.title, p.abstract)
  return {
    journal:  p.journal?.name || 'Semantic Scholar',
    title:    p.title,
    abstract: (p.abstract || '').slice(0, 400),
    url, field, emoji,
    date: dateStr,
    year: p.year,
  }
}

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: 'ok' }

  const forceRefresh = event.queryStringParameters?.refresh === '1'
  const now = Date.now()

  if (cache && !forceRefresh && (now - cacheTime) < CACHE_TTL) {
    return { statusCode: 200, headers: { ...HEADERS, 'X-Cache': 'HIT' }, body: JSON.stringify({ science: cache }) }
  }

  try {
    const papers = await searchS2('coffee specialty arabica fermentation roasting sensory quality 2024 2025', 15)

    const results = []
    const seenIds  = new Set()
    const seenFields = new Set()

    for (const p of papers) {
      if (results.length >= 6) break
      if (!p.abstract || p.abstract.length < 80) continue
      const id = p.externalIds?.DOI || p.paperId
      if (seenIds.has(id)) continue
      seenIds.add(id)
      const paper = formatPaper(p)
      // Prefer variety across fields
      if (seenFields.has(paper.field) && results.length >= 3) continue
      seenFields.add(paper.field)
      results.push(paper)
    }

    // Second pass if not enough results
    if (results.length < 4) {
      const papers2 = await searchS2('Coffea arabica climate genomics agronomy soil 2024', 10)
      for (const p of papers2) {
        if (results.length >= 6) break
        if (!p.abstract || p.abstract.length < 80) continue
        const id = p.externalIds?.DOI || p.paperId
        if (seenIds.has(id)) continue
        seenIds.add(id)
        results.push(formatPaper(p))
      }
    }

    if (results.length === 0) throw new Error('No papers found')

    cache = results
    cacheTime = now

    return {
      statusCode: 200,
      headers: { ...HEADERS, 'X-Cache': 'MISS' },
      body: JSON.stringify({ science: results })
    }

  } catch(err) {
    console.error('get-science error:', err.message)
    if (cache) {
      return { statusCode: 200, headers: { ...HEADERS, 'X-Cache': 'STALE' }, body: JSON.stringify({ science: cache }) }
    }
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) }
  }
}
