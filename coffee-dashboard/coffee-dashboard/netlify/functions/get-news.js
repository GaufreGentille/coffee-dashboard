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
        catch(e) { reject(new Error('JSON parse error: ' + data.slice(0, 200))) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function callClaude(apiKey, prompt) {
  const body = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
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
  const text = data.content?.[0]?.text ?? ''
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

exports.handler = async function(event, context) {
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

  const NEWS_PROMPT = `Tu es un agregateur specialise dans le cafe de specialite. Aujourd'hui nous sommes le ${today}.
Genere 6 actualites recentes et realistes du monde du cafe de specialite.
Sources : Perfect Daily Grind, Sprudge, SCA News, Barista Hustle, Coffee Intelligence, Barista Magazine.
Sujets : marches/prix ICE, competitions WBC/WBrC 2026, torrefacteurs, durabilite, processing, producteurs, certifications, nouveau materiel.
Melange naturellement titres en francais et en anglais (50/50).
Reponds UNIQUEMENT en JSON valide, sans backticks ni markdown :
[{"source":"","title":"","summary":"","url":"https://","topic":"marche|culture|durabilite|competition|producteur|technique|materiel","lang":"fr|en","date":"DD mois YYYY"}]`

  const SCI_PROMPT = `Tu es un agregateur scientifique cafe. Aujourd'hui nous sommes le ${today}.
Genere 5 articles scientifiques recents et realistes sur Coffea arabica/canephora publies en 2025-2026.
Domaines : botanique, agronomie, biochimie, fermentation, genomique, rouille orangee, changement climatique, chimie de tasse.
Journaux : Food Chemistry, Frontiers in Plant Science, Scientia Horticulturae, J. Agric. Food Chem., Agronomy.
Reponds UNIQUEMENT en JSON valide sans backticks :
[{"journal":"","title":"","abstract":"","url":"https://doi.org/10.","field":"botanique|agronomie|biochimie|fermentation|genomique|climatologie","emoji":"plante","date":"Mois YYYY"}]`

  const REDDIT_PROMPT = `Tu es un agregateur Reddit specialise cafe de specialite. Aujourd'hui nous sommes le ${today}.
Genere 8 posts Reddit realistes de r/espresso, r/Coffee et r/barista.
Melange posts en francais et en anglais. Sujets : extraction, materiel, competitions, origines, marches, technique.
Reponds UNIQUEMENT en JSON valide sans backticks :
[{"sub":"r/espresso","title":"","author":"u/pseudo","upvotes":"1.2k","comments":45,"flair":"Technique","url":"https://reddit.com/r/espresso","hot":true,"date":"il y a 4h"}]`

  try {
    const [news, science, reddit] = await Promise.all([
      callClaude(ANTHROPIC_KEY, NEWS_PROMPT),
      callClaude(ANTHROPIC_KEY, SCI_PROMPT),
      callClaude(ANTHROPIC_KEY, REDDIT_PROMPT),
    ])
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ news, science, reddit, generatedAt: new Date().toISOString() })
    }
  } catch(err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    }
  }
}
