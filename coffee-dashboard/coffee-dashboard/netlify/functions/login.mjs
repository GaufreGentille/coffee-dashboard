// login.mjs — connexion par mot de passe unique.
//   GET     → { connecte: true|false }
//   POST    { motdepasse } → dépose le cookie de session
//   DELETE  → retire le cookie

import { autorise, cookieDeSession, cookieVide, memeChaine, cors } from '../lib/auth.mjs'
import { attenteRestante, noterEchec, effacerEchecs, reponseBloquee } from '../lib/limiteur.mjs'

const base = (req) => ({
  'content-type': 'application/json',
  'cache-control': 'no-store',
  ...cors(req),
})

const json = (req, corps, statut = 200, extra = {}) =>
  new Response(JSON.stringify(corps), { status: statut, headers: { ...base(req), ...extra } })

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { ...base(req), 'Access-Control-Allow-Methods': 'GET,POST,DELETE', 'Access-Control-Allow-Credentials': 'true' },
    })
  }

  if (req.method === 'GET') return json(req, { connecte: autorise(req) })

  if (req.method === 'DELETE') {
    return json(req, { ok: true }, 200, { 'set-cookie': cookieVide })
  }

  if (req.method !== 'POST') return json(req, { erreur: 'methode non geree' }, 405)

  const attendu = process.env.KISSA_PASSWORD
  if (!attendu || attendu.length < 8) {
    return json(req, { erreur: 'KISSA_PASSWORD absente ou trop courte' }, 500)
  }

  // 10 mots de passe faux en 15 minutes depuis une même IP : porte fermée.
  const attente = await attenteRestante(req, 'login')
  if (attente > 0) return reponseBloquee(attente, cors(req))

  let corps
  try {
    corps = await req.json()
  } catch {
    return json(req, { erreur: 'JSON invalide' }, 400)
  }

  // Ralentit toute tentative en force brute : 400 ms par essai suffisent à
  // rendre le balayage inintéressant sans se voir à l'usage.
  await new Promise((r) => setTimeout(r, 400))

  if (!memeChaine(String(corps?.motdepasse || ''), attendu)) {
    await noterEchec(req, 'login')
    return json(req, { erreur: 'mot de passe incorrect' }, 401)
  }
  await effacerEchecs(req, 'login')

  try {
    return json(req, { ok: true }, 200, { 'set-cookie': cookieDeSession() })
  } catch (e) {
    return json(req, { erreur: e.message }, 500)
  }
}
