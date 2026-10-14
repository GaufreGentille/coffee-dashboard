// Retrouve les photos des produits sur leur article d'origine lorsque le RSS
// ne fournit pas de vignette. Les URLs sont uniquement des métadonnées réelles,
// jamais des images génériques ou générées.
import { getStore } from '@netlify/blobs'
import { fetchText } from './http.mjs'

const MEDIA_KEY = 'gear-images-article-meta-v1'
const GOOD_FOR_MS = 7 * 24 * 60 * 60 * 1000
const RETRY_AFTER_MS = 3 * 60 * 60 * 1000
const PROVIDERS = ['coffeegeek.com', 'dailycoffeenews.com', 'perfectdailygrind.com', 'baristamagazine.com', 'sprudge.com']

function allowedArticle(raw) {
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' &&
      PROVIDERS.some(host => url.hostname === host || url.hostname.endsWith('.' + host))
  } catch { return false }
}

function decodeAttr(s) {
  return String(s || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, x) => String.fromCodePoint(parseInt(x, 16)))
    .replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
}

function attrs(tag) {
  const obj = {}
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    obj[m[1].toLowerCase()] = decodeAttr(m[2] ?? m[3])
  }
  return obj
}

export function imageFromHtml(html, pageUrl) {
  const choices = []
  // Les métadonnées Open Graph renvoient la vraie photo de l'article.
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const a = attrs(tag)
    const type = String(a.property || a.name || a.itemprop || '').toLowerCase()
    if (['og:image:secure_url', 'og:image', 'twitter:image:src', 'twitter:image', 'image'].includes(type)) {
      choices.push(a.content)
    }
  }
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const a = attrs(tag)
    if (String(a.rel || '').toLowerCase() === 'image_src') choices.push(a.href)
  }

  for (const candidate of choices) {
    if (!candidate) continue
    try {
      const image = new URL(candidate, pageUrl)
      if (image.protocol !== 'https:' || /\.(svg|gif)(?:$|\?)/i.test(image.pathname)) continue
      if (/\b(logo|favicon|avatar|icon)\b/i.test(image.pathname)) continue
      return image.href
    } catch { /* URL d'image incorrecte, on essaie la suivante */ }
  }
  return null
}

async function lookupArticleImage(article) {
  if (!allowedArticle(article)) return null
  try {
    const html = await fetchText(article, { timeout: 6500, headers: { Accept: 'text/html,application/xhtml+xml' } })
    return imageFromHtml(html, article)
  } catch (e) {
    console.info('image article indisponible:', new URL(article).hostname, e.message)
    return null
  }
}

// Résout les vignettes pour un flux DÉJÀ stocké en Netlify Blobs.
// Important : ne relance ni le traducteur ni le collecteur payant.
export async function enrichGearImages(payload) {
  if (!Array.isArray(payload?.gear) || !payload.gear.length) return payload
  const entries = payload.gear
  const store = getStore({ name: 'kissa-feeds', consistency: 'strong' })
  let cache = {}
  try { cache = await store.get(MEDIA_KEY, { type: 'json' }) || {} }
  catch (e) { console.warn('cache images inaccessible:', e.message) }

  const now = Date.now()
  const unchecked = []
  for (const item of entries) {
    if (!allowedArticle(item.url)) continue
    const cached = cache[item.url]
    const validUntil = cached?.checkedAt + (cached?.image ? GOOD_FOR_MS : RETRY_AFTER_MS)
    if (!cached || now >= validUntil) unchecked.push(item.url)
  }
  const urls = [...new Set(unchecked)].slice(0, 16)
  if (urls.length) {
    // Maximum 16 pages en parallèle et 6,5 s de timeout : reste dans le
    // budget de 30 s des Functions Netlify, même avec plusieurs échecs.
    const discovered = await Promise.all(urls.map(async url => ({
      url, image: await lookupArticleImage(url)
    })))
    for (const { url, image } of discovered) cache[url] = { image, checkedAt: now }
    try { await store.setJSON(MEDIA_KEY, cache) }
    catch (e) { console.warn('cache images écriture KO:', e.message) }
  }

  return {
    ...payload,
    gear: entries.map(item => ({
      ...item,
      img: cache[item.url]?.image || item.img || null,
      imgFallback: cache[item.url]?.image && item.img && cache[item.url].image !== item.img
        ? item.img : null
    }))
  }
}
