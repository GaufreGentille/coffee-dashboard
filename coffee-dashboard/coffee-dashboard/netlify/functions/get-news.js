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
  // First try direct parse
  try { return JSON.parse(clean.slice(start)) } catch(e) {}
  // Try finding matching bracket
  const open = clean[start], close = open === '[' ? ']' : '}'
  let depth = 0, end = -1
  for (let i = start; i < clean.length; i++) {
    if (clean[i] === open) depth++
    else if (clean[i] === close && --depth === 0) { end = i; break }
  }
  if (end !== -1) {
    try { return JSON.parse(clean.slice(start, end + 1)) } catch(e) {}
  }
  // Response was truncated — try to salvage by closing open brackets
  let partial = clean.slice(start)
  // Count open braces/brackets to close them
  let opens = []
  for (let i = 0; i < partial.length; i++) {
    if (partial[i] === '{') opens.push('}')
    else if (partial[i] === '[') opens.push(']')
    else if (partial[i] === '}' || partial[i] === ']') opens.pop()
  }
  // Remove trailing comma if any
  partial = partial.replace(/,\s*$/, '')
  // Close all open brackets
  partial += opens.reverse().join('')
  try { return JSON.parse(partial) } catch(e) {
    throw new Error('Unmatched: ' + e.message.slice(0,50))
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function claude(key, prompt, tokens) {
  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: tokens || 3500,
    messages: [{ role: 'user', content: prompt }]
  })
  const data = await httpsPost({
    hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body)
  if (data.error) {
    if (data.error.type === 'overloaded_error') throw new Error('Overloaded')
    throw new Error(data.error.message)
  }
  return safeJSON(data.content?.[0]?.text ?? '')
}

// Single mega-prompt — one call, everything at once
function buildMegaPrompt(today) {
  return `You are a specialty coffee dashboard content generator. Today: ${today}.
Return ONE valid JSON object with exactly these 4 keys. No markdown, no explanation, just JSON.

{
  "news": [
    {"source":"Perfect Daily Grind","title":"Arabica steadies above 300c as Brazil outlook brightens","summary":"Arabica futures hold near 305c after January highs of 340c. Improved rainfall in Cerrado Mineiro lifts 2026/27 crop forecasts.","url":"https://perfectdailygrind.com","topic":"marche","lang":"en","date":"20 mai 2026"},
    {"source":"SCA News","title":"WRITE a real WBC 2026 news title in French","summary":"WRITE 1-2 sentence summary in French","url":"https://sca.coffee","topic":"competition","lang":"fr","date":"19 mai 2026"},
    {"source":"Sprudge","title":"WRITE a real specialty coffee producer news title","summary":"WRITE 1-2 sentence summary","url":"https://sprudge.com","topic":"producteur","lang":"en","date":"18 mai 2026"},
    {"source":"Barista Hustle","title":"WRITE a real extraction or technique news title in French","summary":"WRITE 1-2 sentence summary in French","url":"https://baristahustle.com","topic":"technique","lang":"fr","date":"17 mai 2026"},
    {"source":"Coffee Intelligence","title":"WRITE a real market or business news title","summary":"WRITE 1-2 sentence summary","url":"https://coffeeintelligence.com","topic":"marche","lang":"en","date":"16 mai 2026"},
    {"source":"Cafe Specialite FR","title":"WRITE a real French specialty coffee news title","summary":"WRITE 1-2 sentence summary in French","url":"https://cafedespecialite.fr","topic":"materiel","lang":"fr","date":"15 mai 2026"}
  ],
  "science": [
    {"journal":"Food Chemistry","title":"WRITE real 2026 coffee science paper title","abstract":"WRITE 1-2 sentence abstract","url":"https://doi.org/10.1016/j.foodchem.2026.01.042","field":"fermentation","emoji":"flask","date":"Avr 2026"},
    {"journal":"Frontiers in Plant Science","title":"WRITE real paper title","abstract":"WRITE abstract","url":"https://doi.org/10.3389/fpls.2026.001","field":"genomique","emoji":"leaf","date":"Mar 2026"},
    {"journal":"Scientia Horticulturae","title":"WRITE real paper title","abstract":"WRITE abstract","url":"https://doi.org/10.1016/j.scienta.2026.001","field":"agronomie","emoji":"seedling","date":"Fev 2026"},
    {"journal":"J. Agric Food Chem","title":"WRITE real paper title","abstract":"WRITE abstract","url":"https://doi.org/10.1021/acs.jafc.6c001","field":"biochimie","emoji":"atom","date":"Jan 2026"},
    {"journal":"Agronomy","title":"WRITE real paper title","abstract":"WRITE abstract","url":"https://doi.org/10.3390/agronomy2026.001","field":"climatologie","emoji":"globe","date":"Jan 2026"}
  ],
  "reddit": [
    {"sub":"r/espresso","title":"WRITE real Reddit post title about espresso extraction","author":"u/extractionnerve","upvotes":"2.4k","comments":187,"flair":"Technique","url":"https://reddit.com/r/espresso","hot":true,"date":"il y a 3h"},
    {"sub":"r/Coffee","title":"WRITE real Reddit post title about coffee origins","author":"u/terroir_fan","upvotes":"1.8k","comments":312,"flair":"Discussion","url":"https://reddit.com/r/Coffee","hot":true,"date":"il y a 5h"},
    {"sub":"r/barista","title":"WRITE real Reddit post title about barista competition","author":"u/SCAobserver","upvotes":"3.1k","comments":224,"flair":"Competition","url":"https://reddit.com/r/barista","hot":true,"date":"il y a 8h"},
    {"sub":"r/espresso","title":"WRITE real post title","author":"u/profilemaster","upvotes":"1.2k","comments":98,"flair":"Guide","url":"https://reddit.com/r/espresso","hot":false,"date":"il y a 11h"},
    {"sub":"r/Coffee","title":"WRITE real post title about coffee origins","author":"u/origingeek","upvotes":"876","comments":143,"flair":"Origine","url":"https://reddit.com/r/Coffee","hot":false,"date":"il y a 14h"},
    {"sub":"r/barista","title":"WRITE real post title about barista training","author":"u/sca_student","upvotes":"654","comments":77,"flair":"Formation","url":"https://reddit.com/r/barista","hot":false,"date":"il y a 17h"},
    {"sub":"r/espresso","title":"WRITE real post title about market prices","author":"u/mktwatch","upvotes":"1.5k","comments":289,"flair":"Marche","url":"https://reddit.com/r/espresso","hot":true,"date":"il y a 20h"},
    {"sub":"r/Coffee","title":"WRITE real post title about brew method","author":"u/bloombro","upvotes":"2.0k","comments":156,"flair":"Technique","url":"https://reddit.com/r/Coffee","hot":false,"date":"il y a 1j"}
  ],
  "gear": [
    {"brand":"Fellow","name":"WRITE real Fellow product name","description":"WRITE real description","category":"Moulin","price":"199 EUR","url":"https://fellowproducts.com","hot":true,"img_seed":0},
    {"brand":"La Marzocco","name":"WRITE real La Marzocco product","description":"WRITE description","category":"Machine","price":"WRITE price","url":"https://lamarzocco.com","hot":false,"img_seed":1},
    {"brand":"Normcore","name":"WRITE real Normcore product","description":"WRITE description","category":"Accessories","price":"WRITE price","url":"https://normcorewares.com","hot":true,"img_seed":2},
    {"brand":"Loveramics","name":"WRITE real Loveramics cup","description":"WRITE description","category":"Tasse","price":"WRITE price","url":"https://loveramics.com","hot":false,"img_seed":3},
    {"brand":"Weber Workshops","name":"WRITE real Weber product","description":"WRITE description","category":"Moulin","price":"WRITE price","url":"https://weberworkshops.com","hot":true,"img_seed":4},
    {"brand":"Sibarist","name":"WRITE real Sibarist filter","description":"WRITE description","category":"Filtre","price":"WRITE price","url":"https://sibaristcoffee.com","hot":false,"img_seed":5},
    {"brand":"Orea","name":"WRITE real Orea product","description":"WRITE description","category":"Accessories","price":"WRITE price","url":"https://orea.uk","hot":true,"img_seed":6},
    {"brand":"Kinto","name":"WRITE real Kinto product","description":"WRITE description","category":"Tasse","price":"WRITE price","url":"https://kinto.co.jp","hot":false,"img_seed":7},
    {"brand":"Aillio","name":"WRITE real Aillio product","description":"WRITE description","category":"Torrefacteur","price":"WRITE price","url":"https://aillio.com","hot":true,"img_seed":0}
  ]
}`
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

  if (memCache && !forceRefresh && (now - memCacheTime) < CACHE_TTL) {
    return { statusCode:200, headers:{ ...headers,'X-Cache':'HIT' }, body: JSON.stringify({ ...memCache, fromCache:true }) }
  }

  const today = new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  try {
    // Single call with everything — avoids overload from parallel calls
    const result = await claude(KEY, buildMegaPrompt(today), 3500)

    const gear = Array.isArray(result.gear) ? result.gear.map((g, i) => ({
      ...g,
      img: GEAR_IMGS[(typeof g.img_seed === 'number' ? g.img_seed : i) % GEAR_IMGS.length]
    })) : []

    const final = {
      news:    Array.isArray(result.news)    ? result.news    : [],
      science: Array.isArray(result.science) ? result.science : [],
      reddit:  Array.isArray(result.reddit)  ? result.reddit  : [],
      gear,
      generatedAt: new Date().toISOString()
    }

    memCache     = final
    memCacheTime = now

    return { statusCode:200, headers:{ ...headers,'X-Cache':'MISS' }, body: JSON.stringify(final) }

  } catch(err) {
    if (memCache) {
      return { statusCode:200, headers:{ ...headers,'X-Cache':'STALE' }, body: JSON.stringify({ ...memCache, fromCache:true, stale:true }) }
    }
    return { statusCode:500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
