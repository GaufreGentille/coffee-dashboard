const https = require('https')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

let memCache = null
let memCacheTime = 0
const CACHE_TTL = 23 * 60 * 60 * 1000

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
  if (end === -1) throw new Error('Unmatched')
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

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'ok' }

  const KEY = process.env.ANTHROPIC_API_KEY
  if (!KEY) return { statusCode:500, headers, body: JSON.stringify({ error:'Missing key' }) }

  const forceRefresh = event.queryStringParameters?.refresh === '1'
  const now = Date.now()

  // Serve cache
  if (memCache && !forceRefresh && (now - memCacheTime) < CACHE_TTL) {
    return { statusCode:200, headers:{ ...headers,'X-Cache':'HIT' }, body: JSON.stringify({ ...memCache, fromCache:true }) }
  }

  const today = new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  // ── PROMPTS (concis pour rester sous 10s en parallèle) ──────────────
  const P_NEWS = `Specialty coffee aggregator. Today: ${today}. Return ONLY valid JSON array, no markdown.
Fill REPLACE with real specialty coffee news May 2026. Sources: Perfect Daily Grind, Sprudge, SCA, Barista Hustle, Coffee Intelligence.
[{"source":"Perfect Daily Grind","title":"Arabica holds above 300c as Brazil 2026 harvest improves","summary":"Arabica futures stabilize at 305c after January highs near 340c. Better crop forecasts from Cerrado Mineiro ease volatility.","url":"https://perfectdailygrind.com","topic":"marche","lang":"en","date":"20 mai 2026"},{"source":"SCA News","title":"REPLACE","summary":"REPLACE","url":"https://sca.coffee","topic":"competition","lang":"fr","date":"19 mai 2026"},{"source":"Sprudge","title":"REPLACE","summary":"REPLACE","url":"https://sprudge.com","topic":"producteur","lang":"en","date":"18 mai 2026"},{"source":"Barista Hustle","title":"REPLACE","summary":"REPLACE","url":"https://baristahustle.com","topic":"technique","lang":"fr","date":"17 mai 2026"},{"source":"Coffee Intelligence","title":"REPLACE","summary":"REPLACE","url":"https://coffeeintelligence.com","topic":"marche","lang":"en","date":"16 mai 2026"},{"source":"Cafe Specialite FR","title":"REPLACE","summary":"REPLACE","url":"https://cafedespecialite.fr","topic":"materiel","lang":"fr","date":"15 mai 2026"}]`

  const P_SCI = `Coffee science aggregator. Today: ${today}. Return ONLY valid JSON array, no markdown.
[{"journal":"Food Chemistry","title":"REPLACE with real 2026 paper title","abstract":"REPLACE","url":"https://doi.org/10.1016/j.foodchem.2026.01.042","field":"fermentation","emoji":"flask","date":"Avr 2026"},{"journal":"Frontiers Plant Sci.","title":"REPLACE","abstract":"REPLACE","url":"https://doi.org/10.3389/fpls.2026.001","field":"genomique","emoji":"leaf","date":"Mar 2026"},{"journal":"Scientia Horticulturae","title":"REPLACE","abstract":"REPLACE","url":"https://doi.org/10.1016/j.scienta.2026.001","field":"agronomie","emoji":"seedling","date":"Fev 2026"},{"journal":"J. Agric Food Chem","title":"REPLACE","abstract":"REPLACE","url":"https://doi.org/10.1021/acs.jafc.6c001","field":"biochimie","emoji":"atom","date":"Jan 2026"},{"journal":"Agronomy","title":"REPLACE","abstract":"REPLACE","url":"https://doi.org/10.3390/agronomy2026.001","field":"climatologie","emoji":"globe","date":"Jan 2026"}]`

  const P_REDDIT = `Reddit coffee aggregator. Today: ${today}. Return ONLY valid JSON array, no markdown. Replace all REPLACE.
[{"sub":"r/espresso","title":"REPLACE","author":"u/extractionnerve","upvotes":"2.4k","comments":187,"flair":"Technique","url":"https://reddit.com/r/espresso","hot":true,"date":"il y a 3h"},{"sub":"r/Coffee","title":"REPLACE","author":"u/terroir_fan","upvotes":"1.8k","comments":312,"flair":"Discussion","url":"https://reddit.com/r/Coffee","hot":true,"date":"il y a 5h"},{"sub":"r/barista","title":"REPLACE","author":"u/SCAobserver","upvotes":"3.1k","comments":224,"flair":"Competition","url":"https://reddit.com/r/barista","hot":true,"date":"il y a 8h"},{"sub":"r/espresso","title":"REPLACE","author":"u/profilemaster","upvotes":"1.2k","comments":98,"flair":"Guide","url":"https://reddit.com/r/espresso","hot":false,"date":"il y a 11h"},{"sub":"r/Coffee","title":"REPLACE","author":"u/origingeek","upvotes":"876","comments":143,"flair":"Origine","url":"https://reddit.com/r/Coffee","hot":false,"date":"il y a 14h"},{"sub":"r/barista","title":"REPLACE","author":"u/sca_student","upvotes":"654","comments":77,"flair":"Formation","url":"https://reddit.com/r/barista","hot":false,"date":"il y a 17h"},{"sub":"r/espresso","title":"REPLACE","author":"u/mktwatch","upvotes":"1.5k","comments":289,"flair":"Marche","url":"https://reddit.com/r/espresso","hot":true,"date":"il y a 20h"},{"sub":"r/Coffee","title":"REPLACE","author":"u/bloombro","upvotes":"2.0k","comments":156,"flair":"Technique","url":"https://reddit.com/r/Coffee","hot":false,"date":"il y a 1j"}]`

  const P_GEAR = `Coffee equipment curator. Today: ${today}. Return ONLY valid JSON array, no markdown. Replace all REPLACE with real products from these brands: La Marzocco, Fellow, Mahlkonig, Timemore, 1Zpresso, Weber Workshops, Decent Espresso, Niche Coffee, Normcore, Orea, Sibarist, Hario, Kinto, Saint Anthony Industries, Pullman, Comandante, Kinu, Loveramics, Aillio, Ikawa, Victoria Arduino. hot:true=new release. img_seed 0-7.
[{"brand":"Fellow","name":"REPLACE real product","description":"REPLACE","category":"Moulin","price":"199 EUR","url":"https://fellowproducts.com","hot":true,"img_seed":0},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Machine","price":"REPLACE","url":"https://lamarzocco.com","hot":false,"img_seed":1},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Accessories","price":"REPLACE","url":"https://","hot":true,"img_seed":2},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Tasse","price":"REPLACE","url":"https://","hot":false,"img_seed":3},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Moulin","price":"REPLACE","url":"https://","hot":true,"img_seed":4},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Accessories","price":"REPLACE","url":"https://","hot":false,"img_seed":5},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Filtre","price":"REPLACE","url":"https://","hot":true,"img_seed":6},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Machine","price":"REPLACE","url":"https://","hot":false,"img_seed":7},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Tasse","price":"REPLACE","url":"https://","hot":true,"img_seed":0}]`

  try {
    // Run all 4 calls in parallel — each takes ~2-3s, total ~3-4s well under 10s limit
    const [news, science, reddit, gearRaw] = await Promise.all([
      claude(KEY, P_NEWS, 650),
      claude(KEY, P_SCI, 650),
      claude(KEY, P_REDDIT, 700),
      claude(KEY, P_GEAR, 800),
    ])

    const gear = Array.isArray(gearRaw) ? gearRaw.map((g, i) => ({
      ...g,
      img: GEAR_IMGS[(typeof g.img_seed === 'number' ? g.img_seed : i) % GEAR_IMGS.length]
    })) : []

    const result = {
      news:    Array.isArray(news)    ? news    : [],
      science: Array.isArray(science) ? science : [],
      reddit:  Array.isArray(reddit)  ? reddit  : [],
      gear,
      generatedAt: new Date().toISOString()
    }

    memCache     = result
    memCacheTime = now

    return { statusCode:200, headers:{ ...headers,'X-Cache':'MISS' }, body: JSON.stringify(result) }

  } catch(err) {
    // Serve stale cache if available
    if (memCache) {
      return { statusCode:200, headers:{ ...headers,'X-Cache':'STALE' }, body: JSON.stringify({ ...memCache, fromCache:true, stale:true }) }
    }
    return { statusCode:500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
