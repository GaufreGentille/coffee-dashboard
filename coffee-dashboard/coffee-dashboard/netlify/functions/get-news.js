export default async (req, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) {
    return new Response(JSON.stringify({ error: 'Missing API key' }), { status: 500, headers })
  }

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const NEWS_PROMPT = `Tu es un agrégateur spécialisé dans le café de spécialité. Aujourd'hui nous sommes le ${today}.
Génère 6 actualités récentes et réalistes du monde du café de spécialité.
Sources : Perfect Daily Grind, Sprudge, SCA News, Barista Hustle, Coffee Intelligence, Barista Magazine, Café de Spécialité France.
Sujets : marchés/prix ICE, compétitions WBC/WBrC 2026, torréfacteurs, durabilité, processing (fermentation/anaerobic), producteurs, certifications, nouveau matériel.
Mélange naturellement titres en français et en anglais (50/50).
Réponds UNIQUEMENT en JSON valide, sans backticks ni markdown :
[{"source":"","title":"","summary":"","url":"https://","topic":"marché|culture|durabilité|compétition|producteur|technique|matériel","lang":"fr|en","date":"DD mois YYYY"}]`

  const SCI_PROMPT = `Tu es un agrégateur scientifique café. Aujourd'hui nous sommes le ${today}.
Génère 5 articles scientifiques récents et réalistes sur Coffea arabica/canephora publiés en 2025-2026.
Domaines : botanique, agronomie, biochimie, processing (fermentation/anaerobic/washed), génomique, rouille orangée, changement climatique, chimie de tasse.
Journaux : Food Chemistry, Frontiers in Plant Science, Scientia Horticulturae, J. Agric. Food Chem., Agronomy, Plant & Cell Physiology, Molecules.
Réponds UNIQUEMENT en JSON valide sans backticks :
[{"journal":"","title":"","abstract":"","url":"https://doi.org/10.","field":"botanique|agronomie|biochimie|fermentation|génomique|climatologie","emoji":"🌿","date":"Mois YYYY"}]`

  const REDDIT_PROMPT = `Tu es un agrégateur Reddit spécialisé café de spécialité. Aujourd'hui nous sommes le ${today}.
Génère 8 posts Reddit réalistes et variés provenant de r/espresso, r/Coffee et r/barista.
Mélange posts en français et en anglais. Sujets : extraction, matériel, compétitions, origines, marchés, technique, formation SCA.
Réponds UNIQUEMENT en JSON valide sans backticks :
[{"sub":"r/espresso|r/Coffee|r/barista","title":"","author":"u/","upvotes":"1.2k","comments":45,"flair":"","url":"https://reddit.com/r/","hot":true,"date":"il y a Xh"}]`

  try {
    // Fetch news + science + reddit in parallel
    const [newsRes, sciRes, redditRes] = await Promise.all([
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1200, messages: [{ role: 'user', content: NEWS_PROMPT }] })
      }),
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: SCI_PROMPT }] })
      }),
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: REDDIT_PROMPT }] })
      })
    ])

    const [newsData, sciData, redditData] = await Promise.all([newsRes.json(), sciRes.json(), redditRes.json()])

    const parse = (d) => JSON.parse((d.content?.[0]?.text ?? '').replace(/```json|```/g, '').trim())

    return new Response(JSON.stringify({
      news:    parse(newsData),
      science: parse(sciData),
      reddit:  parse(redditData),
      generatedAt: new Date().toISOString()
    }), { headers })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}

export const config = { path: '/api/news' }
