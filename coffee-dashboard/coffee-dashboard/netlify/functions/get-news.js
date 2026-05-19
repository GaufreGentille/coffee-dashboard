const https = require('https')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

function httpsPost(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch(e) { reject(new Error('JSON parse error: ' + data.slice(0, 300))) }
      })
    })
    req.on('error', reject)
    req.setTimeout(25000, () => { req.destroy(); reject(new Error('Request timeout')) })
    req.write(body)
    req.end()
  })
}

async function callClaude(apiKey, prompt, maxTokens) {
  const body = JSON.stringify({
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
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body)
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error))
  const text = data.content?.[0]?.text ?? ''
  const cleaned = text.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'ok' }
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }) }
  }

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const NEWS_PROMPT = `Agregateur cafe specialite. Date: ${today}.
6 actualites realistes du cafe de specialite. Sources: Perfect Daily Grind, Sprudge, SCA News, Barista Hustle, Coffee Intelligence.
Sujets: marches ICE 2026, WBC 2026, torrefacteurs, processing, producteurs, materiel.
Mix 50/50 francais/anglais. JSON valide uniquement, sans backticks:
[{"source":"","title":"","summary":"","url":"https://perfectdailygrind.com","topic":"marche","lang":"fr","date":"19 mai 2026"}]`

  const SCI_PROMPT = `Agregateur scientifique cafe. Date: ${today}.
5 articles scientifiques 2025-2026 sur Coffea arabica/canephora.
Domaines: botanique, agronomie, biochimie, fermentation, genomique, climatologie.
JSON valide uniquement, sans backticks:
[{"journal":"Food Chemistry","title":"","abstract":"","url":"https://doi.org/10.1016/j.foodchem.2026.01.042","field":"fermentation","emoji":"plant","date":"Avril 2026"}]`

  const REDDIT_PROMPT = `Agregateur Reddit cafe. Date: ${today}.
8 posts Reddit de r/espresso, r/Coffee, r/barista. Mix francais/anglais.
JSON valide uniquement, sans backticks:
[{"sub":"r/espresso","title":"","author":"u/pseudo","upvotes":"1.2k","comments":45,"flair":"Technique","url":"https://reddit.com/r/espresso","hot":true,"date":"il y a 4h"}]`

  try {
    // Sequential calls to avoid timeout — Haiku is much faster than Sonnet
    const news    = await callClaude(ANTHROPIC_KEY, NEWS_PROMPT, 700)
    const science = await callClaude(ANTHROPIC_KEY, SCI_PROMPT, 700)
    const reddit  = await callClaude(ANTHROPIC_KEY, REDDIT_PROMPT, 600)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ news, science, reddit, generatedAt: new Date().toISOString() })
    }
  } catch(err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message, stack: err.stack })
    }
  }
}
