const https = require('https')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

// In-memory cache — persists across warm invocations (typically 15-60 min)
let memCache = null
let memCacheTime = 0
const CACHE_TTL = 23 * 60 * 60 * 1000 // 23 hours

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
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.write(body)
    req.end()
  })
}

function safeParseJSON(text) {
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const start = clean.indexOf('{')
  const end   = clean.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found')
  return JSON.parse(clean.slice(start, end + 1))
}

async function callClaude(key, today) {
  const PROMPT = `You are a specialty coffee content aggregator. Today is ${today}.
Return ONLY a valid JSON object. No markdown, no code fences, no explanation. Use only ASCII quotes.
Fill in all REPLACE values with real relevant specialty coffee content from May 2026.

{"news":[{"source":"Perfect Daily Grind","title":"Arabica futures hold above 300 cents as Brazil harvest improves","summary":"After hitting 340 cents in January 2026 arabica futures stabilize around 305 cents with better crop forecasts from Cerrado Mineiro.","url":"https://perfectdailygrind.com","topic":"marche","lang":"en","date":"19 mai 2026"},{"source":"SCA News","title":"WBC 2026 qualifications terminees - Japon et Colombie dominent","summary":"Les qualifications du World Barista Championship 2026 confirment Kenta Mizuno et Valentina Rios comme grands favoris pour la finale a Melbourne en septembre.","url":"https://sca.coffee","topic":"competition","lang":"fr","date":"18 mai 2026"},{"source":"Sprudge","title":"REPLACE WITH REAL TITLE","summary":"REPLACE WITH REAL SUMMARY","url":"https://sprudge.com","topic":"producteur","lang":"en","date":"17 mai 2026"},{"source":"Barista Hustle","title":"REPLACE WITH REAL TITLE","summary":"REPLACE WITH REAL SUMMARY","url":"https://baristahustle.com","topic":"technique","lang":"fr","date":"16 mai 2026"},{"source":"Coffee Intelligence","title":"REPLACE WITH REAL TITLE","summary":"REPLACE WITH REAL SUMMARY","url":"https://coffeeintelligence.com","topic":"marche","lang":"en","date":"15 mai 2026"},{"source":"Cafe Specialite FR","title":"REPLACE WITH REAL TITLE","summary":"REPLACE WITH REAL SUMMARY","url":"https://cafedespecialite.fr","topic":"materiel","lang":"fr","date":"14 mai 2026"}],"science":[{"journal":"Food Chemistry","title":"REPLACE WITH REAL SCIENTIFIC TITLE","abstract":"REPLACE WITH REAL ABSTRACT","url":"https://doi.org/10.1016/j.foodchem.2026.01.042","field":"fermentation","emoji":"flask","date":"Avril 2026"},{"journal":"Frontiers in Plant Science","title":"REPLACE","abstract":"REPLACE","url":"https://doi.org/10.3389/fpls.2026.118723","field":"genomique","emoji":"leaf","date":"Mars 2026"},{"journal":"Scientia Horticulturae","title":"REPLACE","abstract":"REPLACE","url":"https://doi.org/10.1016/j.scienta.2026.11289","field":"agronomie","emoji":"seedling","date":"Fevrier 2026"},{"journal":"J. Agric. Food Chem.","title":"REPLACE","abstract":"REPLACE","url":"https://doi.org/10.1021/acs.jafc.6c01203","field":"biochimie","emoji":"atom","date":"Janvier 2026"},{"journal":"Agronomy","title":"REPLACE","abstract":"REPLACE","url":"https://doi.org/10.3390/agronomy15020312","field":"climatologie","emoji":"globe","date":"Janvier 2026"}],"reddit":[{"sub":"r/espresso","title":"REPLACE WITH REAL POST TITLE","author":"u/extractionnerve","upvotes":"2.4k","comments":187,"flair":"Brew Journal","url":"https://reddit.com/r/espresso","hot":true,"date":"il y a 4h"},{"sub":"r/Coffee","title":"REPLACE","author":"u/terroir_fan","upvotes":"1.8k","comments":312,"flair":"Discussion","url":"https://reddit.com/r/Coffee","hot":true,"date":"il y a 6h"},{"sub":"r/barista","title":"REPLACE","author":"u/SCAobserver","upvotes":"3.1k","comments":224,"flair":"Competition","url":"https://reddit.com/r/barista","hot":true,"date":"il y a 9h"},{"sub":"r/espresso","title":"REPLACE","author":"u/profilemaster","upvotes":"1.2k","comments":98,"flair":"Guide","url":"https://reddit.com/r/espresso","hot":false,"date":"il y a 12h"},{"sub":"r/Coffee","title":"REPLACE","author":"u/origingeek","upvotes":"876","comments":143,"flair":"Origine","url":"https://reddit.com/r/Coffee","hot":false,"date":"il y a 14h"},{"sub":"r/barista","title":"REPLACE","author":"u/sca_student","upvotes":"654","comments":77,"flair":"Formation","url":"https://reddit.com/r/barista","hot":false,"date":"il y a 18h"},{"sub":"r/espresso","title":"REPLACE","author":"u/marketwatch_eu","upvotes":"1.5k","comments":289,"flair":"Marche","url":"https://reddit.com/r/espresso","hot":true,"date":"il y a 21h"},{"sub":"r/Coffee","title":"REPLACE","author":"u/bloombro","upvotes":"2.0k","comments":156,"flair":"Technique","url":"https://reddit.com/r/Coffee","hot":false,"date":"il y a 1j"}]}`

  const reqBody = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    messages: [{ role: 'user', content: PROMPT }]
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

  // Serve from in-memory cache if fresh
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

  try {
    const content = await callClaude(KEY, today)
    memCache     = { ...content, generatedAt: new Date().toISOString() }
    memCacheTime = now

    return {
      statusCode: 200,
      headers: { ...headers, 'X-Cache': 'MISS' },
      body: JSON.stringify(memCache)
    }
  } catch(err) {
    // If Claude fails but we have stale cache, serve it anyway
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
