const https = require('https')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function httpsPost(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch(e) { reject(new Error('Parse error: ' + data.slice(0, 200))) }
      })
    })
    req.on('error', reject)
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout 20s')) })
    req.write(body)
    req.end()
  })
}

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'ok' }
  }

  const KEY = process.env.ANTHROPIC_API_KEY
  if (!KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing API key' }) }
  }

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  // Single call — all content in one request
  const PROMPT = `Tu es un agregateur du monde du cafe de specialite. Date: ${today}.
Genere du contenu JSON avec exactement cette structure, sans backticks, sans markdown, juste du JSON valide:
{
  "news": [
    {"source":"Perfect Daily Grind","title":"titre en anglais","summary":"resume en anglais","url":"https://perfectdailygrind.com","topic":"marche","lang":"en","date":"19 mai 2026"},
    {"source":"SCA News","title":"titre en francais","summary":"resume","url":"https://sca.coffee","topic":"competition","lang":"fr","date":"18 mai 2026"},
    {"source":"Sprudge","title":"titre","summary":"resume","url":"https://sprudge.com","topic":"producteur","lang":"en","date":"17 mai 2026"},
    {"source":"Barista Hustle","title":"titre","summary":"resume","url":"https://baristahustle.com","topic":"technique","lang":"fr","date":"16 mai 2026"},
    {"source":"Coffee Intelligence","title":"titre","summary":"resume","url":"https://coffeeintelligence.com","topic":"marche","lang":"en","date":"15 mai 2026"},
    {"source":"Cafe Specialite FR","title":"titre","summary":"resume","url":"https://cafedespecialite.fr","topic":"materiel","lang":"fr","date":"14 mai 2026"}
  ],
  "science": [
    {"journal":"Food Chemistry","title":"titre scientifique","abstract":"resume","url":"https://doi.org/10.1016/j.foodchem.2026.01.001","field":"fermentation","emoji":"plante","date":"Avril 2026"},
    {"journal":"Frontiers in Plant Science","title":"titre","abstract":"resume","url":"https://doi.org/10.3389/fpls.2026.001","field":"genomique","emoji":"ADN","date":"Mars 2026"},
    {"journal":"Scientia Horticulturae","title":"titre","abstract":"resume","url":"https://doi.org/10.1016/j.scienta.2026.001","field":"agronomie","emoji":"plante","date":"Fevrier 2026"},
    {"journal":"J. Agric. Food Chem.","title":"titre","abstract":"resume","url":"https://doi.org/10.1021/acs.jafc.6c001","field":"biochimie","emoji":"atome","date":"Janvier 2026"},
    {"journal":"Agronomy","title":"titre","abstract":"resume","url":"https://doi.org/10.3390/agronomy2026.001","field":"climatologie","emoji":"monde","date":"Janvier 2026"}
  ],
  "reddit": [
    {"sub":"r/espresso","title":"titre post","author":"u/pseudo1","upvotes":"2.1k","comments":134,"flair":"Technique","url":"https://reddit.com/r/espresso","hot":true,"date":"il y a 3h"},
    {"sub":"r/Coffee","title":"titre post","author":"u/pseudo2","upvotes":"1.4k","comments":89,"flair":"Discussion","url":"https://reddit.com/r/Coffee","hot":true,"date":"il y a 5h"},
    {"sub":"r/barista","title":"titre post","author":"u/pseudo3","upvotes":"987","comments":67,"flair":"Competition","url":"https://reddit.com/r/barista","hot":false,"date":"il y a 8h"},
    {"sub":"r/espresso","title":"titre post","author":"u/pseudo4","upvotes":"756","comments":45,"flair":"Materiel","url":"https://reddit.com/r/espresso","hot":false,"date":"il y a 11h"},
    {"sub":"r/Coffee","title":"titre post","author":"u/pseudo5","upvotes":"654","comments":38,"flair":"Origine","url":"https://reddit.com/r/Coffee","hot":false,"date":"il y a 14h"},
    {"sub":"r/barista","title":"titre post","author":"u/pseudo6","upvotes":"543","comments":29,"flair":"Formation","url":"https://reddit.com/r/barista","hot":false,"date":"il y a 17h"},
    {"sub":"r/espresso","title":"titre post","author":"u/pseudo7","upvotes":"432","comments":21,"flair":"Marche","url":"https://reddit.com/r/espresso","hot":true,"date":"il y a 20h"},
    {"sub":"r/Coffee","title":"titre post","author":"u/pseudo8","upvotes":"321","comments":18,"flair":"Guide","url":"https://reddit.com/r/Coffee","hot":false,"date":"il y a 1j"}
  ]
}
Remplace tous les champs "titre", "resume", "pseudo" par du vrai contenu pertinent et recent sur le cafe de specialite en mai 2026. Conserve exactement la structure JSON.`

  try {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: PROMPT }]
    })

    const data = await httpsPost({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    }, body)

    if (data.error) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: data.error.message }) }
    }

    const text = (data.content?.[0]?.text ?? '').replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(text)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ...parsed, generatedAt: new Date().toISOString() })
    }

  } catch(err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    }
  }
}
