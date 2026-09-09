// netlify/lib/http.mjs
// Helpers partagés par tous les builders de flux.

const UA = 'Mozilla/5.0 (compatible; KissaSoko/1.0)'

export async function fetchText(url, { timeout = 12000, headers = {} } = {}) {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout),
    headers: {
      'User-Agent': UA,
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      ...headers,
    },
  })
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`)
  const body = await res.text()
  if (body.length < 100) throw new Error(`${url} -> reponse trop courte`)
  return body
}

export async function fetchJSON(url, { timeout = 15000, headers = {} } = {}) {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout),
    headers: { 'User-Agent': UA, 'Accept': 'application/json', ...headers },
  })
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`)
  return res.json()
}

export function strip(s) {
  // Deux passes : beaucoup de flux WordPress échappent deux fois, si bien
  // qu'un &lt;b&gt; redevient une balise après le décodage des entités.
  return stripOnce(stripOnce(s))
}

function stripOnce(s) {
  return (s || '')
    .replace(/<[^>]+>/g, '')
    // Les entités numériques sont décodées, pas supprimées : WordPress
    // encode l'esperluette des URLs en &#038;, la jeter casse les liens.
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#([0-9]+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\u2018/g, "'").replace(/\u2019/g, "'")
    .replace(/\u201C/g, '"').replace(/\u201D/g, '"')
    .replace(/\u2026/g, '...')
    .trim()
}

export function frDate(raw) {
  if (!raw) return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Extrait les <item> d'un flux RSS. Retourne des objets bruts, non typés.
export function rssItems(xml, limit = 20) {
  const raw = xml.match(/<item[\s\S]*?<\/item>/g) || []
  return raw.slice(0, limit).map((item) => {
    const title = strip(
      (item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
        item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ''
    )
    const url = strip(
      (item.match(/<link>([\s\S]*?)<\/link>/) ||
        item.match(/<guid isPermaLink="true">([\s\S]*?)<\/guid>/) || [])[1] || ''
    )
    const summary = strip(
      (item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
        item.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || ''
    )
    const pubDate = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || ''
    return { title, url, summary, date: frDate(pubDate), img: pickImage(item) }
  }).filter((i) => i.title && i.url)
}

// Les flux WordPress logent leur vignette à cinq endroits différents selon
// le thème et les extensions. On les essaie dans l'ordre du plus fiable.
function pickImage(item) {
  const patterns = [
    /<media:content[^>]+url="(https?:\/\/[^"]+)"/,
    /<media:thumbnail[^>]+url="(https?:\/\/[^"]+)"/,
    /<enclosure[^>]+url="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp))[^"]*"/,
    /<img[^>]+src="(https?:\/\/[^"]+)"/,        // image dans content:encoded
    /&lt;img[^&]*src="(https?:\/\/[^"]+)"/,     // description échappée
    /src=&quot;(https?:\/\/[^&]+\.(?:jpg|jpeg|png|webp))/,
    /url="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp))[^"]*"/,
  ]
  for (const rx of patterns) {
    const m = item.match(rx)
    if (m) return m[1]
  }
  return null
}

// Parseur JSON tolérant : retire les fences markdown et referme un objet tronqué.
export function safeJSON(text) {
  const clean = (text || '').replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const a = clean.indexOf('['), b = clean.indexOf('{')
  const start = (a !== -1 && (b === -1 || a < b)) ? a : b
  if (start === -1) throw new Error('Pas de JSON dans la reponse')
  const open = clean[start], close = open === '[' ? ']' : '}'
  let depth = 0, end = -1
  for (let i = start; i < clean.length; i++) {
    if (clean[i] === open) depth++
    else if (clean[i] === close && --depth === 0) { end = i; break }
  }
  if (end === -1) {
    // Réponse coupée par max_tokens. On recule jusqu'au dernier objet complet,
    // sinon on tente de refermer une chaîne laissée ouverte au milieu.
    let partial = clean.slice(start)
    const lastComplete = partial.lastIndexOf('}')
    if (lastComplete !== -1) partial = partial.slice(0, lastComplete + 1)
    partial = partial.replace(/,\s*$/, '')

    const opens = []
    for (const ch of partial) {
      if (ch === '{') opens.push('}')
      else if (ch === '[') opens.push(']')
      else if (ch === '}' || ch === ']') opens.pop()
    }
    partial += opens.reverse().join('')
    return JSON.parse(partial)
  }
  return JSON.parse(clean.slice(start, end + 1))
}

export async function claude(prompt, maxTokens = 2000) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY manquante')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal: AbortSignal.timeout(25000),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return safeJSON(data.content?.[0]?.text ?? '')
}
