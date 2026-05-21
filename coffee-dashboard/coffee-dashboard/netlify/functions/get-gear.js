const https = require('https')

const RESP_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

let cache = null
let cacheTime = 0
const CACHE_TTL = 6 * 60 * 60 * 1000 // 6h

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url)
    const req = https.request({
      hostname: opts.hostname,
      path: opts.pathname + opts.search,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KissaSoko/1.0)', 'Accept': '*/*' }
    }, (res) => {
      if ([301,302,303].includes(res.statusCode) && res.headers.location) {
        return fetchText(res.headers.location).then(resolve).catch(reject)
      }
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => resolve({ status: res.statusCode, body: data }))
    })
    req.on('error', reject)
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.end()
  })
}

function httpsPost(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, (res) => {
      let d = ''; res.on('data', c => d += c)
      res.on('end', () => { try { resolve(JSON.parse(d)) } catch(e) { reject(e) } })
    })
    req.on('error', reject)
    req.setTimeout(25000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.write(body); req.end()
  })
}

function strip(s) {
  return (s||'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&nbsp;/g,' ').replace(/&#8220;/g,'"').replace(/&#8221;/g,'"').replace(/&#8216;/g,"'").replace(/&#8217;/g,"'").replace(/&#8230;/g,'...').replace(/\u2019/g,"'").replace(/\u201C/g,'"').replace(/\u201D/g,'"').trim()
}

// Parse RSS and extract items with pagination support
async function fetchRSSItems(url, limit) {
  const { status, body } = await fetchText(url)
  if (status !== 200) return []
  const items = body.match(/<item>([\s\S]*?)<\/item>/g) || []
  return items.slice(0, limit || 20).map(item => {
    const title   = strip((item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '')
    const link    = strip((item.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '')
    const summary = strip((item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || item.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '').slice(0, 300)
    const date    = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || ''
    const dateStr = date ? new Date(date).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' }) : ''
    return { title, link, summary, date: dateStr }
  }).filter(i => i.title && i.link)
}

// Keywords for gear filtering
// Keywords that signal a new product release or review
const GEAR_KW = [
  'new grinder','new machine','new dripper','new brewer','new kettle','new roaster',
  'launches','launch','unveils','unveil','introduces','releases','new product',
  'now available','available now','just released','new model','new version','gen 2',
  'v2','v3','limited edition','new design','redesigned','updated',
  'review','test drive','hands on','first look','grinder','dripper','espresso machine',
  'home roaster','pour over','kettle','scale','tamper','puck screen','filter paper',
  'hario','fellow','weber','timemore','comandante','normcore','orea','sibarist','kinto',
  'loveramics','ikawa','aillio','decent','niche','baratza','eureka','compak','mahlkonig',
  'la marzocco','rocket','lelit','flair','acaia','brewista'
]

// Keywords that signal trade show coverage to skip
const SKIP_KW = [
  'world of coffee','coffee expo','trade show','booth','exhibitor','convention center',
  'san diego','houston','milan','amsterdam','chicago','coffee show'
]

async function claude(key, prompt, tokens) {
  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: tokens || 2000,
    messages: [{ role:'user', content: prompt }]
  })
  const data = await httpsPost({
    hostname:'api.anthropic.com', path:'/v1/messages', method:'POST',
    headers:{
      'Content-Type':'application/json', 'x-api-key':key,
      'anthropic-version':'2023-06-01', 'Content-Length':Buffer.byteLength(body)
    }
  }, body)
  if (data.error) throw new Error(data.error.message)
  let text = data.content?.[0]?.text || '[]'
  text = text.replace(/```json/g,'').replace(/```/g,'').trim()
  return JSON.parse(text)
}

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers:RESP_HEADERS, body:'ok' }

  const KEY = process.env.ANTHROPIC_API_KEY
  if (!KEY) return { statusCode:500, headers:RESP_HEADERS, body: JSON.stringify({ error:'Missing key' }) }

  const forceRefresh = event.queryStringParameters?.refresh === '1'
  const now = Date.now()

  if (cache && !forceRefresh && (now - cacheTime) < CACHE_TTL) {
    return { statusCode:200, headers:{ ...RESP_HEADERS,'X-Cache':'HIT' }, body: JSON.stringify({ gear: cache }) }
  }

  try {
    // Fetch from multiple sources with higher limit
    const sources = [
      { url:'https://dailycoffeenews.com/feed/?posts_per_page=50', name:'Daily Coffee News' },
      { url:'https://perfectdailygrind.com/feed/',                 name:'Perfect Daily Grind' },
      { url:'https://www.baristamagazine.com/feed/',               name:'Barista Magazine' },
      { url:'https://sprudge.com/feed',                            name:'Sprudge' },
    ]

    const allItems = []
    const seenUrls = new Set()

    for (const src of sources) {
      try {
        const items = await fetchRSSItems(src.url, 30)
        for (const item of items) {
          if (seenUrls.has(item.link)) continue
          const text = (item.title + ' ' + item.summary).toLowerCase()
          const isGear = GEAR_KW.some(k => text.includes(k))
          const isTradeShow = SKIP_KW.some(k => text.includes(k))
          if (isGear && !isTradeShow) {
            seenUrls.add(item.link)
            allItems.push({ ...item, source: src.name })
          }
        }
      } catch(e) {
        console.error('Gear RSS error:', src.name, e.message)
      }
    }

    if (allItems.length < 3) {
      throw new Error('Not enough gear articles from RSS: ' + allItems.length)
    }

    // Category → Unsplash image mapping
    const CAT_IMGS = {
      'Moulin':       'https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=600&q=80',
      'Machine':      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
      'Dripper':      'https://images.unsplash.com/photo-1516743619420-154b70a65fea?w=600&q=80',
      'Accessories':  'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80',
      'Tasse':        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
      'Filtre':       'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80',
      'Torrefacteur': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80',
      'Tech':         'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=600&q=80',
      'default':      'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=600&q=80',
    }

    // Translate and enrich with Claude
    const itemList = allItems.slice(0, 16).map((g,i) =>
      i + '|||' + g.title + '|||' + g.summary + '|||' + g.source + '|||' + g.date + '|||' + g.link
    ).join('\n')

    const prompt = `You are a specialty coffee equipment editor. Translate these English article titles and summaries to French. For each, also determine the category (Moulin, Machine, Dripper, Accessories, Tasse, Filtre, Torrefacteur, Tech) and if it's a new product release (hot:true) or just news (hot:false).
Return ONLY valid JSON array, no markdown:
[{"i":0,"title":"french title","summary":"french summary (2-3 sentences max)","category":"category","hot":true,"url":"original url","source":"source","date":"date"}]

Articles:
${itemList}`

    const translated = await claude(KEY, prompt, 2500)

    if (!Array.isArray(translated) || translated.length === 0) {
      throw new Error('Translation failed')
    }

    // Merge with original URLs
    const gear = translated.map((t, idx) => {
      const original = allItems[t.i !== undefined ? t.i : idx]
      return {
        ...t,
        url:    original ? original.link   : t.url,
        source: original ? original.source : t.source,
        img:    CAT_IMGS[t.category] || CAT_IMGS['default'],
      }
    })

    cache = gear
    cacheTime = now

    return { statusCode:200, headers:{ ...RESP_HEADERS,'X-Cache':'MISS' }, body: JSON.stringify({ gear }) }

  } catch(err) {
    console.error('get-gear error:', err.message)
    if (cache) {
      return { statusCode:200, headers:{ ...RESP_HEADERS,'X-Cache':'STALE' }, body: JSON.stringify({ gear: cache }) }
    }
    return { statusCode:500, headers:RESP_HEADERS, body: JSON.stringify({ error: err.message }) }
  }
}
