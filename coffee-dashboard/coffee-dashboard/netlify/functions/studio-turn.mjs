/**
 * Delivre des identifiants TURN Cloudflare a duree de vie courte.
 * La cle longue duree reste ici, cote serveur : elle ne descend jamais
 * dans le navigateur.
 *
 * ACCES RESERVE. Un relais TURN, c'est de la bande passante facturee sur
 * ton compte Cloudflare : ouvert a tous, c'est un relais gratuit pour
 * n'importe qui, avec n'importe quel trafic.
 * Connexion par cookie (page /connexion.html) ou par ?jeton=... dans l'URL.
 *
 * Sans variables d'environnement, la fonction repond quand meme avec
 * des serveurs STUN publics. La connexion marchera alors en WiFi local
 * mais echouera souvent en 4G, ou le relais est indispensable.
 *
 * Variables a definir dans Netlify :
 *   CLOUDFLARE_TURN_KEY_ID
 *   CLOUDFLARE_TURN_TOKEN
 */

import { autorise, refus } from '../lib/auth.mjs'

// Une session demarre dans la foulee de la demande : deux heures de validite
// n'avaient aucune utilite, dix minutes suffisent largement.
const DUREE_IDENTIFIANTS = 600

const SECOURS = {
  iceServers: [
    { urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302'] },
  ],
  relais: false,
};

export default async (req) => {
  if (!autorise(req)) return refus()

  const id = process.env.CLOUDFLARE_TURN_KEY_ID;
  const jeton = process.env.CLOUDFLARE_TURN_TOKEN;

  if (!id || !jeton) return reponse({ ...SECOURS, motif: 'cles absentes' });

  try {
    const r = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${id}/credentials/generate-ice-servers`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${jeton}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ ttl: DUREE_IDENTIFIANTS, customIdentifier: 'kissasoko-studio' }),
      }
    );

    if (!r.ok) {
      return reponse({ ...SECOURS, motif: `cloudflare ${r.status}` });
    }

    const donnees = await r.json();
    const serveurs = Array.isArray(donnees?.iceServers) ? donnees.iceServers : [donnees?.iceServers];
    return reponse({ iceServers: serveurs.filter(Boolean), relais: true });
  } catch (e) {
    return reponse({ ...SECOURS, motif: String(e?.message || e) });
  }
};

function reponse(corps) {
  return new Response(JSON.stringify(corps), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export const config = { path: '/api/studio-turn' };
