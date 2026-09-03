import { getStore } from '@netlify/blobs';

/**
 * Boite aux lettres de signalisation du studio.
 * Deux cases par session : l'offre deposee par le telephone,
 * la reponse deposee par le PC. Rien d'autre ne transite ici,
 * le flux video passe en direct entre les deux appareils.
 *
 * GET    /api/studio-signal?code=XXX&type=offre
 * POST   /api/studio-signal?code=XXX&type=offre    { session, sdp }
 * DELETE /api/studio-signal?code=XXX&type=offre
 */

const DUREE_VIE = 5 * 60 * 1000;
const CODE_VALIDE = /^[A-Za-z0-9_-]{8,48}$/;
const TYPES = ['offre', 'reponse'];

export default async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code') || '';
  const type = url.searchParams.get('type') || '';

  if (!CODE_VALIDE.test(code)) return reponse({ erreur: 'code invalide' }, 400);
  if (!TYPES.includes(type)) return reponse({ erreur: 'type invalide' }, 400);

  // lecture forte : le PC doit pouvoir relire l'offre juste apres son depot
  const store = getStore({ name: 'studio-signal', consistency: 'strong' });
  const cle = `${code}/${type}`;

  try {
    if (req.method === 'GET') {
      const enveloppe = await store.get(cle, { type: 'json' });
      if (!enveloppe) return reponse({ vide: true });
      if (Date.now() - enveloppe.horodatage > DUREE_VIE) {
        await store.delete(cle);
        return reponse({ vide: true });
      }
      return reponse(enveloppe);
    }

    if (req.method === 'POST') {
      const corps = await req.json();
      if (!corps?.sdp || !corps?.session) return reponse({ erreur: 'charge invalide' }, 400);
      await store.setJSON(cle, {
        session: String(corps.session).slice(0, 64),
        sdp: corps.sdp,
        horodatage: Date.now(),
      });
      return reponse({ ok: true });
    }

    if (req.method === 'DELETE') {
      await store.delete(cle);
      return reponse({ ok: true });
    }
  } catch (e) {
    return reponse({ erreur: 'stockage indisponible', detail: String(e?.message || e) }, 500);
  }

  return reponse({ erreur: 'methode non geree' }, 405);
};

function reponse(corps, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
}

export const config = { path: '/api/studio-signal' };
