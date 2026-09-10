// netlify/lib/auth.mjs
// Authentification maison, volontairement minimale : un mot de passe unique,
// un cookie signé en HMAC, et un jeton d'URL pour les cas où taper un mot de
// passe est impossible (une source navigateur dans OBS, une commande curl).
//
// Variables d'environnement attendues sur Netlify :
//   KISSA_SECRET    chaîne aléatoire longue, sert à signer les cookies
//   KISSA_PASSWORD  le mot de passe que tu tapes pour te connecter
//   KISSA_TOKEN     jeton à coller dans une URL, à la place du mot de passe

import { createHmac, timingSafeEqual } from 'node:crypto'

const NOM_COOKIE = 'kissa_session'
const DUREE = 30 * 24 * 60 * 60 * 1000 // 30 jours

// Comparaison à temps constant : une comparaison normale s'arrête au premier
// caractère différent, ce qui laisse deviner un secret caractère par caractère.
export function memeChaine(a, b) {
  const ba = Buffer.from(String(a), 'utf8')
  const bb = Buffer.from(String(b), 'utf8')
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

function secret() {
  const s = process.env.KISSA_SECRET
  if (!s || s.length < 16) throw new Error('KISSA_SECRET absente ou trop courte')
  return s
}

function signe(charge) {
  return createHmac('sha256', secret()).update(charge).digest('base64url')
}

export function cookieDeSession() {
  const charge = Buffer.from(JSON.stringify({ exp: Date.now() + DUREE })).toString('base64url')
  const valeur = `${charge}.${signe(charge)}`
  return `${NOM_COOKIE}=${valeur}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${DUREE / 1000}`
}

export const cookieVide =
  `${NOM_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`

function sessionValide(entete) {
  const m = new RegExp(`(?:^|;\\s*)${NOM_COOKIE}=([^;]+)`).exec(entete || '')
  if (!m) return false
  const [charge, sig] = m[1].split('.')
  if (!charge || !sig) return false
  if (!memeChaine(sig, signe(charge))) return false
  try {
    const { exp } = JSON.parse(Buffer.from(charge, 'base64url').toString('utf8'))
    return typeof exp === 'number' && Date.now() < exp
  } catch {
    return false
  }
}

function jetonValide(req) {
  const attendu = process.env.KISSA_TOKEN
  if (!attendu || attendu.length < 16) return false
  const fourni =
    new URL(req.url).searchParams.get('jeton') || req.headers.get('x-kissa-jeton') || ''
  return fourni.length > 0 && memeChaine(fourni, attendu)
}

// Le seul point d'entrée à utiliser dans les functions.
export function autorise(req) {
  try {
    return jetonValide(req) || sessionValide(req.headers.get('cookie'))
  } catch (e) {
    // Secret absent : on refuse, jamais l'inverse.
    console.error('auth indisponible:', e.message)
    return false
  }
}

export function refus(message = 'non autorise') {
  return new Response(JSON.stringify({ erreur: message }), {
    status: 401,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

/* ─────────────────────────── CORS ─────────────────────────── */

const ORIGINES = [
  /^https:\/\/kissasoko\.netlify\.app$/,
  /^https:\/\/[a-z0-9-]+--kissasoko\.netlify\.app$/, // aperçus de déploiement
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
]

// Renvoie les en-têtes CORS adaptés. Une origine inconnue n'obtient aucune
// autorisation, donc son navigateur bloquera la lecture de la réponse.
export function cors(req) {
  const origine = req.headers.get('origin')
  if (origine && ORIGINES.some((rx) => rx.test(origine))) {
    return { 'Access-Control-Allow-Origin': origine, 'Vary': 'Origin' }
  }
  return { 'Vary': 'Origin' }
}

export function origineConnue(req) {
  const origine = req.headers.get('origin')
  // Absente : requête hors navigateur, on laisse passer, ce n'est pas un
  // contrôle de sécurité mais un garde-fou contre les intégrations sauvages.
  if (!origine) return true
  return ORIGINES.some((rx) => rx.test(origine))
}
