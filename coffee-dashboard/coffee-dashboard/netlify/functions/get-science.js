const https = require('https')

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

let cache = null
let cacheTime = 0
const CACHE_TTL = 12 * 60 * 60 * 1000 // 12h

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url)
    const req = https.request({
      hostname: opts.hostname,
      path: opts.pathname + opts.search,
      method: 'GET',
      headers: {
        'User-Agent': 'KissaSoko/1.0 (coffee dashboard)',
        'Accept': 'application/json',
      }
    }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }) }
        catch(e) { reject(new Error('Parse error: ' + data.slice(0,100))) }
      })
    })
    req.on('error', reject)
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.end()
  })
}

// Search Semantic Scholar for recent coffee science papers
async function searchPapers(query, limit) {
  const fields = 'title,abstract,year,publicationDate,journal,externalIds,openAccessPdf,url'
  const encoded = encodeURIComponent(query)
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encoded}&fields=${fields}&limit=${limit || 5}&sort=publicationDate`
  const { status, body } = await httpsGet(url)
  if (status !== 200) throw new Error('S2 API returned ' + status)
  return (body.data || []).filter(p => p.title && p.abstract && p.year >= 2023)
}

// Map query to emoji and field
const QUERIES = [
  { q: 'coffee fermentation flavor volatile compounds specialty',   field: 'Fermentation',   emoji: '🧪' },
  { q: 'Coffea arabica climate change adaptation drought genomics', field: 'Génomique',       emoji: '🍃' },
  { q: 'coffee roasting maillard reaction aroma compound',         field: 'Torréfaction',    emoji: '🔥' },
  { q: 'coffee polyphenols chlorogenic acid health bioavailability',field: 'Biochimie',       emoji: '⚛️' },
  { q: 'specialty coffee sensory evaluation cup quality terroir',  field: 'Sensoriel',       emoji: '👃' },
  { q: 'coffee production yield agronomy soil carbon',             field: 'Agronomie',       emoji: '🌱' },
]

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers:HEADERS, body:'ok' }

  const forceRefresh = event.queryStringParameters?.refresh === '1'
  const now = Date.now()

  if (cache && !forceRefresh && (now - cacheTime) < CACHE_TTL) {
    return { statusCode:200, headers:{ ...HEADERS,'X-Cache':'HIT' }, body: JSON.stringify({ science: cache }) }
  }

  try {
    const results = []
    const seenIds = new Set()

    for (const { q, field, emoji } of QUERIES) {
      if (results.length >= 6) break
      try {
        const papers = await searchPapers(q, 3)
        for (const p of papers) {
          // Use DOI if available, otherwise S2 URL
          const doi = p.externalIds?.DOI
          const url = doi
            ? `https://doi.org/${doi}`
            : (p.openAccessPdf?.url || `https://www.semanticscholar.org/paper/${p.paperId}`)
          
          // Skip duplicates
          const id = doi || p.paperId
          if (seenIds.has(id)) continue
          seenIds.add(id)

          const dateStr = p.publicationDate
            ? new Date(p.publicationDate).toLocaleDateString('fr-FR', { month:'short', year:'numeric' })
            : String(p.year)

          results.push({
            journal:  p.journal?.name || 'Semantic Scholar',
            title:    p.title,
            abstract: (p.abstract || '').slice(0, 300),
            url,
            field,
            emoji,
            date:     dateStr,
            year:     p.year,
          })
          break // one paper per query topic
        }
      } catch(e) {
        console.error('S2 query error:', q.slice(0,30), e.message)
      }
    }

    if (results.length === 0) throw new Error('No papers found')

    cache = results
    cacheTime = now

    return {
      statusCode: 200,
      headers: { ...HEADERS, 'X-Cache':'MISS' },
      body: JSON.stringify({ science: results })
    }

  } catch(err) {
    if (cache) {
      return { statusCode:200, headers:{ ...HEADERS,'X-Cache':'STALE' }, body: JSON.stringify({ science: cache }) }
    }
    return { statusCode:500, headers:HEADERS, body: JSON.stringify({ error: err.message }) }
  }
}
