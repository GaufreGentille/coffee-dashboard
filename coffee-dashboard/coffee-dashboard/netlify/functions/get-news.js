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
        catch(e) { reject(new Error('API parse error: ' + data.slice(0, 200))) }
      })
    })
    req.on('error', reject)
    req.setTimeout(25000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.write(body)
    req.end()
  })
}

function safeParseJSON(text) {
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const start = clean.indexOf('[') !== -1 && (clean.indexOf('{') === -1 || clean.indexOf('[') < clean.indexOf('{'))
    ? clean.indexOf('[') : clean.indexOf('{')
  if (start === -1) throw new Error('No JSON found')
  // Find matching closing bracket
  const openChar = clean[start]
  const closeChar = openChar === '[' ? ']' : '}'
  let depth = 0, end = -1
  for (let i = start; i < clean.length; i++) {
    if (clean[i] === openChar) depth++
    else if (clean[i] === closeChar) { depth--; if (depth === 0) { end = i; break } }
  }
  if (end === -1) throw new Error('Unmatched brackets')
  return JSON.parse(clean.slice(start, end + 1))
}

async function callClaude(key, prompt, maxTokens) {
  const reqBody = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens || 800,
    messages: [{ role: 'user', content: prompt }]
  })
  const data = await httpsPost({
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(reqBody)
    }
  }, reqBody)
  if (data.error) throw new Error(data.error.message)
  return safeParseJSON(data.content?.[0]?.text ?? '')
}

const GEAR_IMG = [
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

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'ok' }
  }

  const KEY = process.env.ANTHROPIC_API_KEY
  if (!KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }) }
  }

  const forceRefresh = event.queryStringParameters?.refresh === '1'
  const now = Date.now()

  if (memCache && !forceRefresh && (now - memCacheTime) < CACHE_TTL) {
    return {
      statusCode: 200,
      headers: { ...headers, 'X-Cache': 'HIT' },
      body: JSON.stringify({ ...memCache, fromCache: true })
    }
  }

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const NEWS_PROMPT = `You are a specialty coffee content aggregator. Today is ${today}.
Return ONLY a valid JSON array. No markdown, no code fences. Fill in all REPLACE values with real relevant specialty coffee content from May 2026.
[{"source":"Perfect Daily Grind","title":"Arabica futures hold above 300 cents as Brazil harvest improves","summary":"After hitting 340 cents in January 2026 arabica futures stabilize around 305 cents with better crop forecasts from Cerrado Mineiro.","url":"https://perfectdailygrind.com","topic":"marche","lang":"en","date":"19 mai 2026"},{"source":"SCA News","title":"WBC 2026 qualifications terminees - Japon et Colombie dominent","summary":"Les qualifications du World Barista Championship 2026 confirment Kenta Mizuno et Valentina Rios comme grands favoris pour la finale a Melbourne en septembre.","url":"https://sca.coffee","topic":"competition","lang":"fr","date":"18 mai 2026"},{"source":"Sprudge","title":"REPLACE WITH REAL TITLE","summary":"REPLACE WITH REAL SUMMARY","url":"https://sprudge.com","topic":"producteur","lang":"en","date":"17 mai 2026"},{"source":"Barista Hustle","title":"REPLACE WITH REAL TITLE","summary":"REPLACE WITH REAL SUMMARY","url":"https://baristahustle.com","topic":"technique","lang":"fr","date":"16 mai 2026"},{"source":"Coffee Intelligence","title":"REPLACE WITH REAL TITLE","summary":"REPLACE WITH REAL SUMMARY","url":"https://coffeeintelligence.com","topic":"marche","lang":"en","date":"15 mai 2026"},{"source":"Cafe Specialite FR","title":"REPLACE WITH REAL TITLE","summary":"REPLACE WITH REAL SUMMARY","url":"https://cafedespecialite.fr","topic":"materiel","lang":"fr","date":"14 mai 2026"}]`

  const SCI_PROMPT = `You are a scientific coffee aggregator. Today is ${today}.
Return ONLY a valid JSON array. No markdown, no code fences.
[{"journal":"Food Chemistry","title":"REPLACE WITH REAL SCIENTIFIC TITLE","abstract":"REPLACE WITH REAL ABSTRACT","url":"https://doi.org/10.1016/j.foodchem.2026.01.042","field":"fermentation","emoji":"flask","date":"Avril 2026"},{"journal":"Frontiers in Plant Science","title":"REPLACE","abstract":"REPLACE","url":"https://doi.org/10.3389/fpls.2026.118723","field":"genomique","emoji":"leaf","date":"Mars 2026"},{"journal":"Scientia Horticulturae","title":"REPLACE","abstract":"REPLACE","url":"https://doi.org/10.1016/j.scienta.2026.11289","field":"agronomie","emoji":"seedling","date":"Fevrier 2026"},{"journal":"J. Agric. Food Chem.","title":"REPLACE","abstract":"REPLACE","url":"https://doi.org/10.1021/acs.jafc.6c01203","field":"biochimie","emoji":"atom","date":"Janvier 2026"},{"journal":"Agronomy","title":"REPLACE","abstract":"REPLACE","url":"https://doi.org/10.3390/agronomy15020312","field":"climatologie","emoji":"globe","date":"Janvier 2026"}]`

  const REDDIT_PROMPT = `You are a Reddit specialty coffee aggregator. Today is ${today}.
Return ONLY a valid JSON array. No markdown, no code fences. Replace all REPLACE values with real relevant content.
[{"sub":"r/espresso","title":"REPLACE WITH REAL POST TITLE","author":"u/extractionnerve","upvotes":"2.4k","comments":187,"flair":"Brew Journal","url":"https://reddit.com/r/espresso","hot":true,"date":"il y a 4h"},{"sub":"r/Coffee","title":"REPLACE","author":"u/terroir_fan","upvotes":"1.8k","comments":312,"flair":"Discussion","url":"https://reddit.com/r/Coffee","hot":true,"date":"il y a 6h"},{"sub":"r/barista","title":"REPLACE","author":"u/SCAobserver","upvotes":"3.1k","comments":224,"flair":"Competition","url":"https://reddit.com/r/barista","hot":true,"date":"il y a 9h"},{"sub":"r/espresso","title":"REPLACE","author":"u/profilemaster","upvotes":"1.2k","comments":98,"flair":"Guide","url":"https://reddit.com/r/espresso","hot":false,"date":"il y a 12h"},{"sub":"r/Coffee","title":"REPLACE","author":"u/origingeek","upvotes":"876","comments":143,"flair":"Origine","url":"https://reddit.com/r/Coffee","hot":false,"date":"il y a 14h"},{"sub":"r/barista","title":"REPLACE","author":"u/sca_student","upvotes":"654","comments":77,"flair":"Formation","url":"https://reddit.com/r/barista","hot":false,"date":"il y a 18h"},{"sub":"r/espresso","title":"REPLACE","author":"u/marketwatch_eu","upvotes":"1.5k","comments":289,"flair":"Marche","url":"https://reddit.com/r/espresso","hot":true,"date":"il y a 21h"},{"sub":"r/Coffee","title":"REPLACE","author":"u/bloombro","upvotes":"2.0k","comments":156,"flair":"Technique","url":"https://reddit.com/r/Coffee","hot":false,"date":"il y a 1j"}]`

  const GEAR_PROMPT = `You are a specialty coffee equipment curator. Today is ${today}.
Generate 9 specialty coffee equipment items — mix of hot new releases and curated must-haves — from these brands: La Marzocco, Fellow Products, Mahlkonig, Timemore, 1Zpresso, Weber Workshops, Decent Espresso, Kafatek, Option-O, Niche Coffee, Normcore, Orea, IMS Filtri, Sibarist, Hario, Kinto, Cafec, Saint Anthony Industries, Pullman Espresso, Comandante, Kinu, Eureka, Loveramics, Aillio, Ikawa, Rocket Espresso, Victoria Arduino.
Categories: Moulin, Machine, Accessories, Tasse, Torrefacteur, Filtre.
hot:true = brand new release. coup_de_coeur:true = personal curated pick (not necessarily new).
img_seed: integer 0-7.
Return ONLY a valid JSON array, no markdown:
[{"brand":"Fellow Products","name":"Opus Conical Grinder Limited Edition Matte Black","description":"REPLACE WITH REAL DESCRIPTION of this or similar real product","category":"Moulin","price":"199 EUR","url":"https://fellowproducts.com","hot":true,"coup_de_coeur":false,"img_seed":0},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Machine","price":"REPLACE","url":"https://","hot":false,"coup_de_coeur":true,"img_seed":1},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Accessories","price":"REPLACE","url":"https://","hot":true,"coup_de_coeur":false,"img_seed":2},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Tasse","price":"REPLACE","url":"https://","hot":false,"coup_de_coeur":true,"img_seed":3},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Moulin","price":"REPLACE","url":"https://","hot":true,"coup_de_coeur":false,"img_seed":4},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Accessories","price":"REPLACE","url":"https://","hot":false,"coup_de_coeur":true,"img_seed":5},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Filtre","price":"REPLACE","url":"https://","hot":true,"coup_de_coeur":false,"img_seed":6},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Machine","price":"REPLACE","url":"https://","hot":false,"coup_de_coeur":true,"img_seed":7},{"brand":"REPLACE","name":"REPLACE","description":"REPLACE","category":"Tasse","price":"REPLACE","url":"https://","hot":true,"coup_de_coeur":false,"img_seed":0}]`

  try {
    const news    = await callClaude(KEY, NEWS_PROMPT, 700)
    const science = await callClaude(KEY, SCI_PROMPT, 700)
    const reddit  = await callClaude(KEY, REDDIT_PROMPT, 700)
    const gearRaw = await callClaude(KEY, GEAR_PROMPT, 900)

    const gear = Array.isArray(gearRaw) ? gearRaw.map((g, i) => ({
      ...g,
      img: GEAR_IMG[(g.img_seed !== undefined ? g.img_seed : i) % GEAR_IMG.length]
    })) : []

    const result = {
      news: Array.isArray(news) ? news : [],
      science: Array.isArray(science) ? science : [],
      reddit: Array.isArray(reddit) ? reddit : [],
      gear,
      generatedAt: new Date().toISOString()
    }

    memCache     = result
    memCacheTime = now

    return {
      statusCode: 200,
      headers: { ...headers, 'X-Cache': 'MISS' },
      body: JSON.stringify(result)
    }
  } catch(err) {
    if (memCache) {
      return {
        statusCode: 200,
        headers: { ...headers, 'X-Cache': 'STALE' },
        body: JSON.stringify({ ...memCache, fromCache: true, stale: true })
      }
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    }
  }
}
