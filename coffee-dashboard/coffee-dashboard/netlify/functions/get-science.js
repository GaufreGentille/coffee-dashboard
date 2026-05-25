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
      headers: { 'User-Agent': 'KissaSoko/1.0', 'Accept': 'application/json' }
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
  { keywords: ['ferment','anaerob','microb','yeast','lactic','wet process'], field:'Fermentation',  emoji:'🧪' },
  { keywords: ['genomic','crispr','breed','genetic','drought','resilience'], field:'Génomique',     emoji:'🍃' },
  { keywords: ['roast','maillard','pyrazine','melanoidin','thermal','roasting'], field:'Torréfaction', emoji:'🔥' },
  { keywords: ['chlorogenic','polyphenol','antioxidant','phenolic'],         field:'Biochimie',     emoji:'⚛️' },
  { keywords: ['sensory','cupping','flavor','aroma','volatile','consumer'],  field:'Sensoriel',     emoji:'👃' },
  { keywords: ['agronomy','yield','soil','shade','climate','production','cultivation'], field:'Agronomie', emoji:'🌱' },
]

function classifyPaper(title, abstract) {
  const text = (title + ' ' + (abstract || '')).toLowerCase()
  for (const { keywords, field, emoji } of FIELD_MAP) {
    if (keywords.some(k => text.includes(k))) return { field, emoji }
  }
  return { field: 'Recherche', emoji: '🔬' }
}

// PubMed NCBI E-utilities — free, no key required
async function searchPubMed(query, retmax) {
  // Step 1: search for IDs
  const searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term='
    + encodeURIComponent(query)
    + '&retmax=' + (retmax || 10)
    + '&sort=date&retmode=json'

  const { status: s1, body: b1 } = await httpsGet(searchUrl)
  if (s1 !== 200) throw new Error('PubMed search status ' + s1)
  const ids = (b1.esearchresult?.idlist || []).slice(0, retmax || 10)
  if (ids.length === 0) return []

  // Step 2: fetch summaries
  const summaryUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id='
    + ids.join(',')
    + '&retmode=json'

  const { status: s2, body: b2 } = await httpsGet(summaryUrl)
  if (s2 !== 200) throw new Error('PubMed summary status ' + s2)

  const result = b2.result || {}
  return ids.map(id => result[id]).filter(Boolean)
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
    // One PubMed search — free, no rate limit issues
    const papers = await searchPubMed('coffee arabica specialty fermentation sensory roasting quality[Title/Abstract]', 20)

    const results = []
    const seenIds = new Set()
    const seenFields = new Set()

    for (const p of papers) {
      if (results.length >= 6) break
      const id = p.uid
      if (!id || seenIds.has(id)) continue
      seenIds.add(id)

      const title = p.title || ''
      if (!title) continue

      // Build PubMed URL — always valid
      const url = 'https://pubmed.ncbi.nlm.nih.gov/' + id + '/'

      const journal = p.fulljournalname || p.source || 'PubMed'
      const pubDate = p.pubdate || p.epubdate || ''
      const dateStr = pubDate
        ? new Date(pubDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
        : ''

      // Build abstract from available fields
      const abstract = [p.title, p.sorttitle].filter(Boolean).join(' ')

      const { field, emoji } = classifyPaper(title, abstract)
      if (seenFields.has(field) && results.length >= 3) continue
      seenFields.add(field)

      results.push({
        journal,
        title: title.replace(/\.$/, ''),
        abstract: abstract.slice(0, 300),
        url,
        field,
        emoji,
        date: dateStr,
        year: p.pubdate ? new Date(p.pubdate).getFullYear() : null,
      })
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
