const https = require('https')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

let memCache = null
let memCacheTime = 0
const CACHE_TTL = 23 * 60 * 60 * 1000

// ── HTTP helpers ───────────────────────────────────────────
function httpsGetText(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url)
    const req = https.request({
      hostname: opts.hostname,
      path: opts.pathname + opts.search,
      method: 'GET',
      headers: {
        'User-Agent': 'KissaSoko/1.0 RSS Reader',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return httpsGetText(res.headers.location).then(resolve).catch(reject)
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.end()
  })
}

function httpsPost(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch(e) { reject(new Error('Parse: ' + data.slice(0, 100))) }
      })
    })
    req.on('error', reject)
    req.setTimeout(28000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.write(body)
    req.end()
  })
}

function safeJSON(text) {
  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const a = clean.indexOf('['), b = clean.indexOf('{')
  const start = (a !== -1 && (b === -1 || a < b)) ? a : b
  if (start === -1) throw new Error('No JSON')
  const open = clean[start], close = open === '[' ? ']' : '}'
  let depth = 0, end = -1
  for (let i = start; i < clean.length; i++) {
    if (clean[i] === open) depth++
    else if (clean[i] === close && --depth === 0) { end = i; break }
  }
  if (end === -1) {
    let partial = clean.slice(start).replace(/,\s*$/, '')
    let opens = []
    for (let i = 0; i < partial.length; i++) {
      if (partial[i] === '{') opens.push('}')
      else if (partial[i] === '[') opens.push(']')
      else if (partial[i] === '}' || partial[i] === ']') opens.pop()
    }
    partial += opens.reverse().join('')
    try { return JSON.parse(partial) } catch(e) { throw new Error('Unmatched') }
  }
  return JSON.parse(clean.slice(start, end + 1))
}

function claude(key, prompt, tokens) {
  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: tokens || 700,
    messages: [{ role: 'user', content: prompt }]
  })
  return httpsPost({
    hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body).then(d => {
    if (d.error) throw new Error(d.error.message)
    return safeJSON(d.content?.[0]?.text ?? '')
  })
}

// ── RSS parser ─────────────────────────────────────────────
function stripHtml(str) {
  return (str || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g,'&')
    .replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"')
    .replace(/&#039;/g,"'")
    .replace(/&nbsp;/g,' ')
    .replace(/&#8220;/g,'"').replace(/&#8221;/g,'"')
    .replace(/&#8216;/g,"'").replace(/&#8217;/g,"'")
    .replace(/&#8230;/g,'...')
    .replace(/&#8212;/g,'—').replace(/&#8211;/g,'–')
    .replace(/‘/g,"'").replace(/’/g,"'")
    .replace(/“/g,'"').replace(/”/g,'"')
    .replace(/…/g,'...')
    .replace(/—/g,'—').replace(/–/g,'–')
    .trim()
}

function parseRSS(xml, sourceName, topic, lang) {
  const items = []
  const rawItems = xml.match(/<item[\s\S]*?<\/item>/g) || []
  for (const item of rawItems.slice(0, 4)) {
    const title   = stripHtml((item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '')
    const link    = stripHtml((item.match(/<link>([\s\S]*?)<\/link>/) || item.match(/<guid isPermaLink="true">([\s\S]*?)<\/guid>/) || [])[1] || '')
    const desc    = stripHtml((item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || item.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '').slice(0, 220)
    const pubDate = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || ''
    const img     = (item.match(/url="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp))[^"]*"/) || item.match(/<media:thumbnail[^>]+url="([^"]+)"/) || [])[1] || null
    if (title && link) {
      const d = pubDate ? new Date(pubDate) : new Date()
      const dateStr = d.toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })
      items.push({ source:sourceName, title, summary:desc, url:link, topic, lang, date:dateStr, img })
    }
  }
  return items
}

// ── Parse Sprudge Substack RSS directly (full content included) ──
async function fetchSprudgeCommunity() {
  const xml = await httpsGetText('https://sprudge.substack.com/feed')
  const tiles = []

  // Get the latest newsletter item only
  const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/)
  if (!itemMatch) return tiles
  const item = itemMatch[1]

  // Get publish date
  const pubDateRaw = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || ''
  const pubDate = pubDateRaw
    ? new Date(pubDateRaw).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })
    : ''

  // Get full encoded content
  const encoded = (item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/) || [])[1] || ''
  if (!encoded) return tiles

  // Extract each h3 section
  const h3regex = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|<\/body>|$)/g
  let m
  while ((m = h3regex.exec(encoded)) !== null) {
    const rawTitle = m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&#[0-9]+;/g,'').trim()
    const body = m[2]

    if (!rawTitle || rawTitle.length < 4) continue

    // Get first sprudge.com link
    const sprudgeLink = (body.match(/href="(https:\/\/sprudge\.com\/[^"]+)"/) || [])[1] || null

    // Skip pure ad sections (no sprudge link, only external ad links)
    const hasSprudgeContent = sprudgeLink || body.includes('sprudge.com')
    const isAdOnly = !hasSprudgeContent && (
      body.includes('swisswater.com') ||
      body.includes('pacificfoodservice') ||
      body.includes('noissue.co') ||
      body.includes('lamarzoccousa.com/about')
    )
    if (isAdOnly) continue

    // Get full text from all paragraphs
    const paras = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    const fullText = paras
      .map(p => p[1].replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&#[0-9]+;/g,'').replace(/’/g,"'").replace(/“/g,'"').replace(/”/g,'"').trim())
      .filter(t => t.length > 15)
      .join(' ')
      .trim()

    if (!fullText) continue

    // Get image
    const imgM = body.match(/src="(https:\/\/substackcdn[^"]+\.(jpg|jpeg|png|webp|heic)[^"]*)"/)
    const img = imgM ? imgM[1] : null

    tiles.push({
      source: 'The Sprudge Report',
      title: rawTitle,
      summary: fullText.slice(0, 800),
      url: sprudgeLink || 'https://sprudge.com',
      topic: 'communaute',
      lang: 'en',
      date: pubDate,
      img,
    })
  }

  return tiles.slice(0, 10)
}

// ── Translate Sprudge tiles to French via Claude ──────────
async function translateTilesToFrench(key, tiles) {
  if (!tiles || tiles.length === 0) return tiles
  // Build a compact prompt with all tiles
  const tileList = tiles.map((t, i) => `${i}|||${t.title}|||${t.body || t.summary || ''}`).join('\n')
  const prompt = `Translate these specialty coffee newsletter sections from English to French. 
Keep translation natural and fluid. Return ONLY valid JSON array, no markdown.
Each item: {"i": number, "title": "french title", "summary": "french full text"}
Translate the full text faithfully — do not summarize or shorten.

Sections to translate:
${tileList}`

  try {
    const result = await claude(key, prompt, 2000)
    if (!Array.isArray(result)) return tiles
    return tiles.map((tile, i) => {
      const translated = result.find(r => r.i === i)
      if (!translated) return tile
      return {
        ...tile,
        title:   translated.title   || tile.title,
        summary: translated.summary || tile.summary || tile.body || '',
      }
    })
  } catch(e) {
    console.error('Translation error:', e.message)
    return tiles // fallback to English
  }
}

// ── Fetch all RSS sources ──────────────────────────────────
async function fetchAllRSS() {
  const newsSources = [
    { url:'https://perfectdailygrind.com/feed/',   name:'Perfect Daily Grind', topic:'actualite',  lang:'en' },
    { url:'https://sprudge.com/feed',               name:'Sprudge',            topic:'culture',    lang:'en' },
    { url:'https://dailycoffeenews.com/feed',       name:'Daily Coffee News',  topic:'industrie',  lang:'en' },
    { url:'https://www.baristamagazine.com/feed/',  name:'Barista Magazine',   topic:'barista',    lang:'en' },
    { url:'https://sca.coffee/news/rss',            name:'SCA News',           topic:'association', lang:'en' },
  ]
  const allNews = []
  for (const src of newsSources) {
    try {
      const xml = await httpsGetText(src.url)
      allNews.push(...parseRSS(xml, src.name, src.topic, src.lang))
    } catch(e) {
      console.error('RSS error:', src.name, e.message)
    }
  }

  // Sprudge Substack: parse RSS directly then translate to French
  let community = []
  try {
    const rawTiles = await fetchSprudgeCommunity()
    if (rawTiles.length > 0) {
      community = await translateTilesToFrench(KEY, rawTiles)
    }
  } catch(e) {
    console.error('Substack error:', e.message)
    community = []
  }

  return { allNews, community }
}

// ── Image pools ────────────────────────────────────────────
const GEAR_IMGS = [
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=600&q=80',
  'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=600&q=80',
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=80',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80',
  'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&q=80',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80',
]

// ── Main handler ───────────────────────────────────────────
exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'ok' }

  const KEY = process.env.ANTHROPIC_API_KEY
  if (!KEY) return { statusCode:500, headers, body: JSON.stringify({ error:'Missing key' }) }

  // POST: translate community tiles to French
  if (event.httpMethod === 'POST') {
    try {
      const { prompt } = JSON.parse(event.body || '{}')
      if (!prompt) return { statusCode:400, headers, body: JSON.stringify({ error:'No prompt' }) }
      const body = JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role:'user', content: prompt }]
      })
      const data = await httpsPost({
        hostname:'api.anthropic.com', path:'/v1/messages', method:'POST',
        headers:{
          'Content-Type':'application/json',
          'x-api-key': KEY,
          'anthropic-version':'2023-06-01',
          'Content-Length': Buffer.byteLength(body)
        }
      }, body)
      if (data.error) return { statusCode:500, headers, body: JSON.stringify({ error: data.error.message }) }
      const text = data.content?.[0]?.text || '[]'
      return { statusCode:200, headers, body: text }
    } catch(e) {
      return { statusCode:500, headers, body: JSON.stringify({ error: e.message }) }
    }
  }

  const forceRefresh = event.queryStringParameters?.refresh === '1'
  const now = Date.now()

  if (memCache && !forceRefresh && (now - memCacheTime) < CACHE_TTL) {
    return { statusCode:200, headers:{ ...headers,'X-Cache':'HIT' }, body: JSON.stringify({ ...memCache, fromCache:true }) }
  }

  const today = new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  // Claude only for science, gear, reddit (topics without free RSS)
  const P_CLAUDE = `You are a specialty coffee content generator. Today: ${today}.
Return ONE valid JSON object with exactly 3 keys: science, gear, reddit. No markdown, no explanation.

{
  "science": [
    {"journal":"Food Chemistry","title":"WRITE real 2026 coffee science paper title","abstract":"WRITE 1-2 sentence abstract","url":"https://doi.org/10.1016/j.foodchem.2026.04.042","field":"fermentation","emoji":"flask","date":"Avr 2026"},
    {"journal":"Frontiers in Plant Science","title":"WRITE real paper","abstract":"WRITE abstract","url":"https://doi.org/10.3389/fpls.2026.001","field":"genomique","emoji":"leaf","date":"Mar 2026"},
    {"journal":"Scientia Horticulturae","title":"WRITE real paper","abstract":"WRITE abstract","url":"https://doi.org/10.1016/j.scienta.2026.001","field":"agronomie","emoji":"seedling","date":"Fev 2026"},
    {"journal":"J. Agric. Food Chem.","title":"WRITE real paper","abstract":"WRITE abstract","url":"https://doi.org/10.1021/acs.jafc.6c001","field":"biochimie","emoji":"atom","date":"Jan 2026"},
    {"journal":"Agronomy","title":"WRITE real paper","abstract":"WRITE abstract","url":"https://doi.org/10.3390/agronomy2026.001","field":"climatologie","emoji":"globe","date":"Jan 2026"}
  ],
  "gear": [
    {"brand":"Fellow","name":"WRITE real Fellow product","description":"WRITE description","category":"Moulin","price":"199 EUR","url":"https://fellowproducts.com/products/WRITE-slug","hot":true,"img_seed":0},
    {"brand":"La Marzocco","name":"WRITE real product","description":"WRITE","category":"Machine","price":"WRITE","url":"https://lamarzocco.com/en/WRITE","hot":false,"img_seed":1},
    {"brand":"Normcore","name":"WRITE real product","description":"WRITE","category":"Accessories","price":"WRITE","url":"https://normcorewares.com/products/WRITE","hot":true,"img_seed":2},
    {"brand":"Loveramics","name":"WRITE real cup","description":"WRITE","category":"Tasse","price":"WRITE","url":"https://loveramics.com/collections/WRITE","hot":false,"img_seed":3},
    {"brand":"Weber Workshops","name":"WRITE real product","description":"WRITE","category":"Moulin","price":"WRITE","url":"https://weberworkshops.com/products/WRITE","hot":true,"img_seed":4},
    {"brand":"Sibarist","name":"WRITE real filter","description":"WRITE","category":"Filtre","price":"WRITE","url":"https://sibaristcoffee.com/products/WRITE","hot":false,"img_seed":5},
    {"brand":"Orea","name":"WRITE real product","description":"WRITE","category":"Accessories","price":"WRITE","url":"https://orea.uk/products/WRITE","hot":true,"img_seed":6},
    {"brand":"Kinto","name":"WRITE real product","description":"WRITE","category":"Tasse","price":"WRITE","url":"https://kinto.co.jp/en/WRITE","hot":false,"img_seed":7},
    {"brand":"Aillio","name":"WRITE real product","description":"WRITE","category":"Torrefacteur","price":"WRITE","url":"https://aillio.com/products/WRITE","hot":true,"img_seed":0}
  ],
  "reddit": []
}`

  try {
    // RSS for real news + Claude for science/gear/reddit in parallel
    const [rssResult, claudeData] = await Promise.all([
      fetchAllRSS(),
      claude(KEY, P_CLAUDE, 2500),
    ])
    const rssNews = rssResult.allNews
    const rssComm = rssResult.community

    const gear = Array.isArray(claudeData.gear) ? claudeData.gear.map((g, i) => ({
      ...g,
      img: GEAR_IMGS[(typeof g.img_seed === 'number' ? g.img_seed : i) % GEAR_IMGS.length]
    })) : []

    // Separate community (Sprudge Substack) from main news
    const community = rssComm.length > 0 ? rssComm : []
    const news      = rssNews

    const result = {
      news:      news.length > 0 ? news : [],
      science:   Array.isArray(claudeData.science) ? claudeData.science : [],
      community: community.length > 0 ? community : [],
      gear,
      generatedAt: new Date().toISOString()
    }

    memCache     = result
    memCacheTime = now

    return { statusCode:200, headers:{ ...headers,'X-Cache':'MISS' }, body: JSON.stringify(result) }

  } catch(err) {
    if (memCache) {
      return { statusCode:200, headers:{ ...headers,'X-Cache':'STALE' }, body: JSON.stringify({ ...memCache, fromCache:true, stale:true }) }
    }
    return { statusCode:500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
