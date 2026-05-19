export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  const AV_KEY = process.env.ALPHA_VANTAGE_KEY
  if (!AV_KEY) {
    return new Response(JSON.stringify({ error: 'Missing market API key' }), { status: 500, headers })
  }

  // Fetch Forex rates (EUR/USD, BRL/USD) from Alpha Vantage
  async function getForex(from, to) {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${AV_KEY}`
    const res = await fetch(url)
    const data = await res.json()
    const rate = data['Realtime Currency Exchange Rate']
    if (!rate) return null
    return {
      price: parseFloat(rate['5. Exchange Rate']),
      prev:  parseFloat(rate['8. Bid Price']),
    }
  }

  try {
    // Alpha Vantage free tier: commodity futures not available directly.
    // We use forex for EUR/USD and BRL/USD, and serve indicative coffee prices
    // (real ICE futures require a paid commodity feed — upgrade path noted below)
    const [eurusd, brlusd] = await Promise.all([
      getForex('EUR', 'USD'),
      getForex('BRL', 'USD'),
    ])

    const calcChg = (q) => {
      if (!q) return { val:'N/A', chg:'—', up:true }
      const chg = q.price - q.prev
      const pct = (chg / q.prev) * 100
      return {
        val:  q.price.toFixed(4),
        chg:  `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
        up:   pct >= 0
      }
    }

    // Coffee commodity prices: indicative (ICE real-time requires paid feed)
    // Once you have a paid feed (e.g. Commodities-API.com), replace these
    const markets = [
      { label:'Arabica · ICE', val:'305.2', unit:'¢/lb', chg:'+0.9%', up:true,  note:'Indicatif ICE' },
      { label:'Robusta · ICE', val:'5,490', unit:'$/t',  chg:'-0.3%', up:false, note:'Indicatif ICE' },
      { label:'EUR/USD',       ...calcChg(eurusd), unit:'',     note:'Temps réel' },
      { label:'BRL/USD',       ...calcChg(brlusd), unit:'',     note:'Temps réel' },
    ]

    return new Response(JSON.stringify({
      markets,
      updatedAt: new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
    }), { headers })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}

export const config = { path: '/api/markets' }
