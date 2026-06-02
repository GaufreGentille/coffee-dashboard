const https = require('https')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'KissaSoko/1.0' } }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch(e) { reject(new Error('Parse error')) }
      })
    }).on('error', reject)
  })
}

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: 'ok' }

  const AV_KEY = process.env.ALPHA_VANTAGE_KEY

  async function getForex(from, to) {
    if (!AV_KEY) return null
    try {
      const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${AV_KEY}`
      const data = await httpsGet(url)
      const rate = data['Realtime Currency Exchange Rate']
      if (!rate) return null
      const price = parseFloat(rate['5. Exchange Rate'])
      const bid   = parseFloat(rate['8. Bid Price'])
      const chg   = price - bid
      const pct   = (chg / bid) * 100
      return {
        val:  price.toFixed(4),
        chg:  `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
        up:   pct >= 0,
        note: 'Temps réel'
      }
    } catch { return null }
  }

  async function getArabica() {
    try {
      const data = await httpsGet('https://kissa-soko-markets.raphimignon.workers.dev')
      return data?.markets?.find(m => m.label === 'Arabica ICE') || null
    } catch { return null }
  }

  const [arabica, eurusd] = await Promise.all([
    getArabica(),
    getForex('EUR', 'USD'),
  ])

  const markets = [
    arabica
      ? { label:'Arabica ICE', ...arabica }
      : { label:'Arabica ICE', val:'--', unit:'c/lb', chg:'', up:true, note:'Indisponible' },
    { label:'EUR/USD', ...(eurusd || { val:'--', chg:'', up:true, note:'Indisponible' }), unit:'' },
  ]

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      markets,
      updatedAt: new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
    })
  }
}
