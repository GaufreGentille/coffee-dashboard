/**
 * Delivre des identifiants TURN Cloudflare a duree de vie courte.
 * La cle longue duree reste ici, cote serveur : elle ne descend jamais
 * dans le navigateur.
 *
 * Sans variables d'environnement, la fonction repond quand meme avec
 * des serveurs STUN publics. La connexion marchera alors en WiFi local
 * mais echouera souvent en 4G, ou le relais est indispensable.
 *
 * Variables a definir dans Netlify :
 *   CLOUDFLARE_TURN_KEY_ID
 *   CLOUDFLARE_TURN_TOKEN
 */

const SECOURS = {
  iceServers: [
    { urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302'] },
  ],
  relais: false,
};

export default async () => {
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
        body: JSON.stringify({ ttl: 7200, customIdentifier: 'kissasoko-studio' }),
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
