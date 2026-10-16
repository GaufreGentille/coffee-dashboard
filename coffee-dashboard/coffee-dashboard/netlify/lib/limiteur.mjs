// netlify/lib/limiteur.mjs
// Limite les essais ratés par adresse IP (mot de passe, clé admin).
// Au-delà de MAX échecs dans la fenêtre, l'IP est refusée jusqu'à la fin de
// la fenêtre, même avec le bon secret : un balayage s'arrête net.
//
// L'IP n'est jamais stockée en clair : seule son empreinte salée l'est.
// Les compteurs vivent dans Netlify Blobs (magasin « limiteur ») et
// s'effacent d'eux-mêmes au premier essai après la fenêtre.

import { createHash } from 'node:crypto'
import { getStore } from '@netlify/blobs'

const MAX = 10
const FENETRE_MS = 15 * 60 * 1000

const store = () => getStore({ name: 'limiteur', consistency: 'strong' })

function ipDe(req) {
  return (
    req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'inconnue'
  )
}

function cle(req, portee) {
  const sel = process.env.KISSA_SECRET || process.env.VEILLE_SECRET || 'kissa'
  const empreinte = createHash('sha256').update(`${sel}|${portee}|${ipDe(req)}`).digest('hex').slice(0, 32)
  return `${portee}/${empreinte}`
}

async function lire(k) {
  try {
    const v = await store().get(k, { type: 'json' })
    if (!v || Date.now() - v.debut > FENETRE_MS) return null
    return v
  } catch {
    return null // Blobs indisponible : on ne bloque personne par erreur
  }
}

// Renvoie le nombre de secondes d'attente si l'IP est bloquée, sinon 0.
export async function attenteRestante(req, portee) {
  const v = await lire(cle(req, portee))
  if (!v || v.echecs < MAX) return 0
  return Math.ceil((v.debut + FENETRE_MS - Date.now()) / 1000)
}

export async function noterEchec(req, portee) {
  const k = cle(req, portee)
  const v = (await lire(k)) || { debut: Date.now(), echecs: 0 }
  v.echecs += 1
  try { await store().setJSON(k, v) } catch { /* compteur perdu, sans gravité */ }
}

export async function effacerEchecs(req, portee) {
  try { await store().delete(cle(req, portee)) } catch { /* rien à effacer */ }
}

export function reponseBloquee(secondes, entetes = {}) {
  const minutes = Math.max(1, Math.ceil(secondes / 60))
  return new Response(
    JSON.stringify({ erreur: `Trop d'essais. Réessaie dans ${minutes} min.`, error: `Trop d'essais. Réessaie dans ${minutes} min.` }),
    {
      status: 429,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'Retry-After': String(secondes), ...entetes },
    }
  )
}
