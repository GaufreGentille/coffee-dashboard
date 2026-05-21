const https = require('https')

const headers = {
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
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KissaSoko/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchText(res.headers.location).then(resolve).catch(reject)
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve({ status: res.statusCode, body: data }))
    })
    req.on('error', reject)
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('Timeout')) })
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
        catch(e) { reject(new Error('Parse error')) }
      })
    })
    req.on('error', reject)
    req.setTimeout(25000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.write(body)
    req.end()
  })
}

function parseTiles(xml) {
  const tiles = []
  const itemM = xml.match(/<item>([\s\S]*?)<\/item>/)
  if (!itemM) return tiles
  const item = itemM[1]

  const pubDateRaw = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || ''
  const pubDate = pubDateRaw
    ? new Date(pubDateRaw).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })
    : ''

  const encoded = (item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/) || [])[1] || ''
  if (!encoded) return tiles

  const h3rx = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|$)/g
  let m
  while ((m = h3rx.exec(encoded)) !== null) {
    const title = m[1].replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&#[0-9]+;/g,'').replace(/\u2019/g,"'").trim()
    const body  = m[2]
    if (!title || title.length < 4) continue

    const sprudgeLink = (body.match(/href="(https:\/\/sprudge\.com\/[^"]+)"/) || [])[1] || null
    const isAd = !sprudgeLink && (
      body.includes('swisswater.com') || body.includes('pacificfoodservice') ||
      body.includes('noissue.co') || body.includes('lamarzoccousa.com/about')
    )
    if (isAd) continue

    const paras = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    const text = paras
      .map(p => p[1].replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ')
        .replace(/&#[0-9]+;/g,'').replace(/\u2019/g,"'").replace(/\u201C/g,'"').replace(/\u201D/g,'"').trim())
      .filter(t => t.length > 10).join(' ').slice(0, 800)

    if (!text) continue

    const imgM = body.match(/src="(https:\/\/substackcdn[^"]+\.(jpg|jpeg|png|webp|heic)[^"]*)"/i)
    tiles.push({
      source: 'The Sprudge Report',
      title, summary: text,
      url: sprudgeLink || 'https://sprudge.com',
      date: pubDate,
      img: imgM ? imgM[1] : null,
    })
  }
  return tiles.slice(0, 10)
}

async function translateTiles(key, tiles) {
  const sections = tiles.map((t,i) => i + '|||' + t.title + '|||' + t.summary).join('\n')
  const prompt = 'Translate these specialty coffee newsletter sections to French. Natural fluid translation. Return ONLY valid JSON array, no markdown.\nEach object: {"i":0,"title":"french title","summary":"full french text"}\n\nSections:\n' + sections

  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    messages: [{ role:'user', content: prompt }]
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

  if (data.error) throw new Error(data.error.message)
  const text = data.content?.[0]?.text || '[]'
  const clean = text.replace(/```json/g,'').replace(/```/g,'').trim()
  const translated = JSON.parse(clean)

  if (!Array.isArray(translated)) return tiles
  return tiles.map((t, i) => {
    const tr = translated.find(x => x.i === i)
    return tr ? { ...t, title: tr.title || t.title, summary: tr.summary || t.summary } : t
  })
}

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'ok' }

  const KEY = process.env.ANTHROPIC_API_KEY
  if (!KEY) return { statusCode:500, headers, body: JSON.stringify({ error:'Missing key' }) }

  const forceRefresh = event.queryStringParameters?.refresh === '1'
  const now = Date.now()

  if (cache && !forceRefresh && (now - cacheTime) < CACHE_TTL) {
    return { statusCode:200, headers:{ ...headers,'X-Cache':'HIT' }, body: JSON.stringify({ tiles: cache }) }
  }

  try {
    const { status, body } = await fetchText('https://sprudge.substack.com/feed')
    if (status !== 200 || body.length < 100) {
      throw new Error('Substack returned ' + status + ', body: ' + body.slice(0,50))
    }

    const rawTiles = parseTiles(body)
    if (rawTiles.length === 0) throw new Error('No tiles parsed from feed')

    const translated = await translateTiles(KEY, rawTiles)

    cache = translated
    cacheTime = now

    return { statusCode:200, headers:{ ...headers,'X-Cache':'MISS' }, body: JSON.stringify({ tiles: translated }) }
  } catch(err) {
    if (cache) {
      return { statusCode:200, headers:{ ...headers,'X-Cache':'STALE' }, body: JSON.stringify({ tiles: cache }) }
    }
    return { statusCode:500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
