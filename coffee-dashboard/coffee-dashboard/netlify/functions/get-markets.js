const https = require('https')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'ok' }
  }

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
        chg:  `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
        up:   pct >= 0,
        note: 'Temps reel'
      }
    } catch { return null }
  }

  const [eurusd, brlusd] = await Promise.all([
    getForex('EUR', 'USD'),
    getForex('BRL', 'USD'),
  ])

  const markets = [
    { label:'Arabica ICE', val:'305.2', unit:'c/lb', chg:'+0.9%', up:true,  note:'Indicatif' },
    { label:'Robusta ICE', val:'5,490', unit:'$/t',  chg:'-0.3%', up:false, note:'Indicatif' },
    { label:'EUR/USD', ...(eurusd || { val:'1.1240', chg:'+0.1%', up:true,  note:'Indicatif' }), unit:'' },
    { label:'BRL/USD', ...(brlusd || { val:'0.1876', chg:'+0.4%', up:true,  note:'Indicatif' }), unit:'' },
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
