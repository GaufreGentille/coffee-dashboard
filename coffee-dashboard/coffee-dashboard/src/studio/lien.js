/**
 * Petite couche partagee entre la page camera et la page de reception.
 * Elle ne fait que trois choses : recuperer les serveurs ICE,
 * deposer et relever du courrier, et attendre la fin de la collecte ICE.
 */

const API_SIGNAL = '/api/studio-signal';
const API_TURN = '/api/studio-turn';
const CLE_LOCALE = 'kissasoko.studio.code';

export async function obtenirIceServers() {
  try {
    const r = await fetch(API_TURN, { cache: 'no-store' });
    const d = await r.json();
    return { iceServers: d.iceServers || [], relais: !!d.relais, motif: d.motif };
  } catch {
    return {
      iceServers: [{ urls: ['stun:stun.cloudflare.com:3478'] }],
      relais: false,
      motif: 'fonction injoignable',
    };
  }
}

export async function poster(code, type, session, sdp) {
  const r = await fetch(`${API_SIGNAL}?code=${encodeURIComponent(code)}&type=${type}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ session, sdp }),
  });
  if (!r.ok) throw new Error(`depot ${type} refuse (${r.status})`);
  return r.json();
}

export async function lire(code, type) {
  const r = await fetch(`${API_SIGNAL}?code=${encodeURIComponent(code)}&type=${type}`, {
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`lecture ${type} refusee (${r.status})`);
  const d = await r.json();
  return d.vide ? null : d;
}

export async function effacer(code, type) {
  try {
    await fetch(`${API_SIGNAL}?code=${encodeURIComponent(code)}&type=${type}`, { method: 'DELETE' });
  } catch {
    /* sans importance */
  }
}

/**
 * On attend la fin de la collecte ICE avant d'envoyer le SDP.
 * Ca evite tout l'echange de candidats au fil de l'eau : une seule
 * ecriture de chaque cote, beaucoup moins de code et de pannes.
 * Le plafond de temps evite de rester coince si un serveur ne repond pas.
 */
export function attendreIce(pc, plafond = 5000) {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resoudre) => {
    const fini = () => {
      pc.removeEventListener('icegatheringstatechange', surEtat);
      clearTimeout(minuteur);
      resoudre();
    };
    const surEtat = () => {
      if (pc.iceGatheringState === 'complete') fini();
    };
    const minuteur = setTimeout(fini, plafond);
    pc.addEventListener('icegatheringstatechange', surEtat);
  });
}

export function nouvelleSession() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** Code de salon : 16 caracteres, c'est lui qui protege l'acces. */
export function genererCode() {
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
  const brut = new Uint8Array(16);
  crypto.getRandomValues(brut);
  return Array.from(brut, (n) => alphabet[n % alphabet.length]).join('');
}

export function codeDepuisUrl() {
  const morceau = window.location.hash.split('?')[1];
  if (!morceau) return null;
  const code = new URLSearchParams(morceau).get('code');
  return code && code.length >= 8 ? code : null;
}

export function codeMemorise() {
  try {
    return localStorage.getItem(CLE_LOCALE);
  } catch {
    return null;
  }
}

export function memoriserCode(code) {
  try {
    localStorage.setItem(CLE_LOCALE, code);
  } catch {
    /* navigation privee */
  }
}

/** Lit le debit reel sortant et le chemin emprunte par la connexion. */
export async function lireStats(pc, precedent) {
  const rapport = await pc.getStats();
  let sortant = null;
  let chemin = null;
  rapport.forEach((r) => {
    if (r.type === 'outbound-rtp' && r.kind === 'video') sortant = r;
    if (r.type === 'candidate-pair' && r.state === 'succeeded' && (r.nominated || r.selected)) chemin = r;
  });
  if (!sortant) return null;

  let debit = null;
  if (precedent && sortant.bytesSent > precedent.octets && sortant.timestamp > precedent.instant) {
    const dOctets = sortant.bytesSent - precedent.octets;
    const dTemps = (sortant.timestamp - precedent.instant) / 1000;
    debit = (dOctets * 8) / dTemps;
  }

  return {
    octets: sortant.bytesSent,
    instant: sortant.timestamp,
    debit,
    largeur: sortant.frameWidth,
    hauteur: sortant.frameHeight,
    fps: sortant.framesPerSecond,
    limite: sortant.qualityLimitationReason,
    relais: chemin ? chemin.remoteCandidateId?.includes('relay') || undefined : undefined,
  };
}
