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

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: 'ok' }

  const forceRefresh = event.queryStringParameters?.refresh === '1'
  const now = Date.now()

  if (cache && !forceRefresh && (now - cacheTime) < CACHE_TTL) {
    return { statusCode: 200, headers: { ...HEADERS, 'X-Cache': 'HIT' }, body: JSON.stringify({ science: cache }) }
  }

  try {
    // Proxy vers Cloudflare Worker — pas de restrictions réseau
    const { status, body } = await httpsGet('https://kissa-soko-science.raphimignon.workers.dev')
    if (status !== 200 || !body.science) throw new Error('Worker error: ' + status)

    cache = body.science
    cacheTime = now

    return {
      statusCode: 200,
      headers: { ...HEADERS, 'X-Cache': 'MISS' },
      body: JSON.stringify({ science: body.science })
    }
  } catch(err) {
    console.error('get-science error:', err.message)
    if (cache) {
      return { statusCode: 200, headers: { ...HEADERS, 'X-Cache': 'STALE' }, body: JSON.stringify({ science: cache }) }
    }
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) }
  }
}
