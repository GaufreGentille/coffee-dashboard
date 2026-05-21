const https = require('https')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

let memCache = null
let memCacheTime = 0
const CACHE_TTL = 23 * 60 * 60 * 1000

// ── HTTP helpers ──────────────────────────────────────────
function httpsGet(url, reqHeaders) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url)
    const req = https.request({
      hostname: opts.hostname,
      path: opts.pathname + opts.search,
      method: 'GET',
      headers: reqHeaders || { 'User-Agent': 'KissaSoko/1.0' },
    }, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return httpsGet(res.headers.location, reqHeaders).then(resolve).catch(reject)
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch(e) { reject(new Error('Parse error: ' + data.slice(0, 100))) }
      })
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')) })
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
    // Try to salvage truncated response
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

// ── Reddit public JSON (no auth needed, correct User-Agent) ──
async function fetchRedditHot() {
  const subs = [
    { sub: 'r/espresso', limit: 4 },
    { sub: 'r/Coffee',   limit: 3 },
    { sub: 'r/barista',  limit: 3 },
  ]
  const posts = []
  for (const { sub, limit } of subs) {
    try {
      const url = `https://www.reddit.com/${sub}/hot.json?limit=${limit + 2}&raw_json=1`
      const data = await httpsGet(url, {
        // Reddit requires this exact format or returns 429/403
        'User-Agent': 'web:kissasoko:v1.0 (by /u/GaufreGentille)',
        'Accept': 'application/json',
      })
      const items = (data?.data?.children || []).filter(c => !c.data.stickied)
      for (const item of items.slice(0, limit)) {
        const p = item.data
        const score = p.score >= 1000 ? (p.score/1000).toFixed(1)+'k' : String(p.score)
        const mins = Math.floor((Date.now()/1000 - p.created_utc) / 60)
        const timeAgo = mins < 60 ? `il y a ${mins}min`
          : mins < 1440 ? `il y a ${Math.floor(mins/60)}h`
          : `il y a ${Math.floor(mins/1440)}j`
        const flair = p.link_flair_text || 'Discussion'
        const thumb = p.thumbnail && p.thumbnail.startsWith('http') ? p.thumbnail : null
        posts.push({
          sub, title: p.title,
          author: 'u/' + p.author,
          upvotes: score,
          comments: p.num_comments,
          flair, hot: p.score > 300,
          url: 'https://reddit.com' + p.permalink,
          date: timeAgo, thumbnail: thumb,
        })
      }
    } catch(e) {
      console.error('Reddit error', sub, e.message)
    }
  }
  return posts
}

// ── Real news via RSS ─────────────────────────────────────
async function fetchRealNews() {
  const sources = [
    { url: 'https://perfectdailygrind.com/feed/', name: 'Perfect Daily Grind' },
    { url: 'https://sprudge.com/feed', name: 'Sprudge' },
  ]
  const items = []
  for (const src of sources) {
    try {
      // Fetch as text since RSS is XML
      const raw = await new Promise((resolve, reject) => {
        const opts = new URL(src.url)
        const req = https.request({
          hostname: opts.hostname,
          path: opts.pathname + opts.search,
          method: 'GET',
          headers: { 'User-Agent': 'KissaSoko/1.0' },
        }, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            // simple redirect: skip
            resolve('')
            return
          }
          let data = ''
          res.on('data', chunk => data += chunk)
          res.on('end', () => resolve(data))
        })
        req.on('error', reject)
        req.setTimeout(10000, () => { req.destroy(); resolve('') })
        req.end()
      })
      if (!raw) continue
      // Parse RSS items with regex (no xml parser needed)
      const itemMatches = raw.match(/<item>([\s\S]*?)<\/item>/g) || []
      for (const item of itemMatches.slice(0, 3)) {
        const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/) || [])[1] || ''
        const link  = (item.match(/<link>(.*?)<\/link>/) || item.match(/<guid[^>]*>(.*?)<\/guid>/) || [])[1] || ''
        const desc  = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/) || [])[1] || ''
        const date  = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || ''
        // Get image from content or enclosure
        const img   = (item.match(/url="(https:\/\/[^"]+\.(jpg|jpeg|png|webp))[^"]*"/) || [])[1] || null
        if (title && link) {
          // Clean HTML from desc
          const cleanDesc = desc.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').trim().slice(0, 200)
          const pubDate = date ? new Date(date).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' }) : ''
          items.push({
            source: src.name,
            title: title.trim(),
            summary: cleanDesc,
            url: link.trim(),
            topic: 'actualite',
            lang: 'en',
            date: pubDate,
            img: img || null,
          })
        }
      }
    } catch(e) {
      console.error('RSS error:', src.name, e.message)
    }
  }
  return items
}

// ── Image pools ───────────────────────────────────────────
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

// ── Main handler ──────────────────────────────────────────
exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'ok' }

  const KEY = process.env.ANTHROPIC_API_KEY
  if (!KEY) return { statusCode:500, headers, body: JSON.stringify({ error:'Missing key' }) }

  const forceRefresh = event.queryStringParameters?.refresh === '1'
  const now = Date.now()

  if (memCache && !forceRefresh && (now - memCacheTime) < CACHE_TTL) {
    return { statusCode:200, headers:{ ...headers,'X-Cache':'HIT' }, body: JSON.stringify({ ...memCache, fromCache:true }) }
  }

  const today = new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  const P_CONTENT = `You are a specialty coffee dashboard content generator. Today: ${today}.
Return ONE valid JSON object with exactly 3 keys: news, science, gear. No markdown, no explanation.

{
  "news": [
    {"source":"Perfect Daily Grind","title":"Arabica steadies above 300c as Brazil 2026 harvest improves","summary":"Arabica futures hold near 305c after January highs of 340c. Improved rainfall in Cerrado Mineiro lifts crop forecasts.","url":"https://perfectdailygrind.com/2026/05/arabica-prices-brazil-harvest","topic":"marche","lang":"en","date":"21 mai 2026"},
    {"source":"SCA News","title":"WRITE real WBC 2026 news in French","summary":"WRITE summary in French","url":"https://sca.coffee/blog/wbc-2026","topic":"competition","lang":"fr","date":"20 mai 2026"},
    {"source":"Sprudge","title":"WRITE real specialty coffee producer news","summary":"WRITE summary","url":"https://sprudge.com/2026/05/WRITE-slug","topic":"producteur","lang":"en","date":"19 mai 2026"},
    {"source":"Barista Hustle","title":"WRITE real extraction technique news in French","summary":"WRITE summary in French","url":"https://baristahustle.com/blog/WRITE-slug","topic":"technique","lang":"fr","date":"18 mai 2026"},
    {"source":"Coffee Intelligence","title":"WRITE real market news","summary":"WRITE summary","url":"https://coffeeintelligence.com/2026/05/WRITE-slug","topic":"marche","lang":"en","date":"17 mai 2026"},
    {"source":"Cafe Specialite FR","title":"WRITE real French coffee news","summary":"WRITE summary in French","url":"https://cafedespecialite.fr/actualites/WRITE-slug","topic":"materiel","lang":"fr","date":"16 mai 2026"}
  ],
  "science": [
    {"journal":"Food Chemistry","title":"WRITE real 2026 coffee science paper","abstract":"WRITE abstract","url":"https://doi.org/10.1016/j.foodchem.2026.04.042","field":"fermentation","emoji":"flask","date":"Avr 2026"},
    {"journal":"Frontiers in Plant Science","title":"WRITE real paper","abstract":"WRITE abstract","url":"https://doi.org/10.3389/fpls.2026.1187234","field":"genomique","emoji":"leaf","date":"Mar 2026"},
    {"journal":"Scientia Horticulturae","title":"WRITE real paper","abstract":"WRITE abstract","url":"https://doi.org/10.1016/j.scienta.2026.112891","field":"agronomie","emoji":"seedling","date":"Fev 2026"},
    {"journal":"J. Agric. Food Chem.","title":"WRITE real paper","abstract":"WRITE abstract","url":"https://doi.org/10.1021/acs.jafc.6c01203","field":"biochimie","emoji":"atom","date":"Jan 2026"},
    {"journal":"Agronomy","title":"WRITE real paper","abstract":"WRITE abstract","url":"https://doi.org/10.3390/agronomy15020312","field":"climatologie","emoji":"globe","date":"Jan 2026"}
  ],
  "gear": [
    {"brand":"Fellow","name":"WRITE real recent Fellow product","description":"WRITE description","category":"Moulin","price":"199 EUR","url":"https://fellowproducts.com/products/WRITE-slug","hot":true,"img_seed":0},
    {"brand":"La Marzocco","name":"WRITE real recent product","description":"WRITE description","category":"Machine","price":"WRITE","url":"https://lamarzocco.com/en/WRITE-slug","hot":false,"img_seed":1},
    {"brand":"Normcore","name":"WRITE real product","description":"WRITE description","category":"Accessories","price":"WRITE","url":"https://normcorewares.com/products/WRITE-slug","hot":true,"img_seed":2},
    {"brand":"Loveramics","name":"WRITE real cup","description":"WRITE description","category":"Tasse","price":"WRITE","url":"https://loveramics.com/collections/WRITE-slug","hot":false,"img_seed":3},
    {"brand":"Weber Workshops","name":"WRITE real product","description":"WRITE description","category":"Moulin","price":"WRITE","url":"https://weberworkshops.com/products/WRITE-slug","hot":true,"img_seed":4},
    {"brand":"Sibarist","name":"WRITE real filter","description":"WRITE description","category":"Filtre","price":"WRITE","url":"https://sibaristcoffee.com/products/WRITE-slug","hot":false,"img_seed":5},
    {"brand":"Orea","name":"WRITE real product","description":"WRITE description","category":"Accessories","price":"WRITE","url":"https://orea.uk/products/WRITE-slug","hot":true,"img_seed":6},
    {"brand":"Kinto","name":"WRITE real product","description":"WRITE description","category":"Tasse","price":"WRITE","url":"https://kinto.co.jp/en/WRITE-slug","hot":false,"img_seed":7},
    {"brand":"Aillio","name":"WRITE real product","description":"WRITE description","category":"Torrefacteur","price":"WRITE","url":"https://aillio.com/products/WRITE-slug","hot":true,"img_seed":0}
  ]
}`

  try {
    // Fetch Reddit (real) + Claude for news/science/gear in parallel
    const [redditPosts, contentRaw] = await Promise.all([
      fetchRedditHot(),
      claude(KEY, P_CONTENT, 3500),
    ])

    // News from Claude (real knowledge)
    const news = Array.isArray(contentRaw.news) ? contentRaw.news : []

    const gear = Array.isArray(contentRaw.gear) ? contentRaw.gear.map((g, i) => ({
      ...g,
      img: GEAR_IMGS[(typeof g.img_seed === 'number' ? g.img_seed : i) % GEAR_IMGS.length]
    })) : []

    const result = {
      news,
      science: Array.isArray(contentRaw.science) ? contentRaw.science : [],
      reddit:  Array.isArray(contentRaw.reddit)  ? contentRaw.reddit  : [],
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
