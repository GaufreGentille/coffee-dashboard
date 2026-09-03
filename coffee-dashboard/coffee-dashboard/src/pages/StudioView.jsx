import { useState, useRef, useEffect, useCallback } from 'react';
import {
  obtenirIceServers,
  poster,
  lire,
  attendreIce,
  codeDepuisUrl,
  codeMemorise,
  memoriserCode,
} from '../studio/lien';

/**
 * StudioView
 * Page de reception, destinee a etre capturee par OBS en source navigateur.
 * Elle surveille la boite aux lettres, repond a l'offre du telephone,
 * et affiche le flux plein cadre sans aucun habillage.
 *
 * Adresse OBS : https://kissasoko.netlify.app/#studio-view?code=TON_CODE
 *
 * Le rythme de surveillance ralentit tout seul quand rien ne se passe,
 * pour ne pas cramer le quota de fonctions Netlify si la source
 * reste ouverte toute la journee.
 */

const RYTHMES = [
  { avant: 120_000, delai: 2000 },   // deux premieres minutes : reactif
  { avant: 600_000, delai: 10_000 }, // puis on lache du lest
  { avant: Infinity, delai: 30_000 },
];

export default function StudioView() {
  const [code, setCode] = useState(() => codeDepuisUrl() || codeMemorise() || '');
  const [saisie, setSaisie] = useState('');
  const [etat, setEtat] = useState('veille'); // veille | negociation | connecte | perdu
  const [note, setNote] = useState(null);
  const [sonBloque, setSonBloque] = useState(false);

  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const sessionRef = useRef(null);
  const depuisRef = useRef(Date.now());
  const vivantRef = useRef(true);

  useEffect(() => {
    if (code) memoriserCode(code);
  }, [code]);

  const fermerPc = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
  }, []);

  const repondre = useCallback(
    async (offre) => {
      setEtat('negociation');
      setNote(null);
      fermerPc();

      try {
        const { iceServers, relais, motif } = await obtenirIceServers();
        if (!relais) setNote(`relais indisponible (${motif || 'inconnu'})`);

        const pc = new RTCPeerConnection({ iceServers, bundlePolicy: 'max-bundle' });
        pcRef.current = pc;

        pc.ontrack = (e) => {
          if (videoRef.current && videoRef.current.srcObject !== e.streams[0]) {
            videoRef.current.srcObject = e.streams[0];
            videoRef.current.play().catch(() => setSonBloque(true));
          }
        };

        pc.onconnectionstatechange = () => {
          const s = pc.connectionState;
          if (s === 'connected') {
            setEtat('connecte');
            depuisRef.current = Date.now();
          } else if (s === 'failed' || s === 'disconnected' || s === 'closed') {
            setEtat('perdu');
            sessionRef.current = null;
          }
        };

        await pc.setRemoteDescription(offre.sdp);
        const reponse = await pc.createAnswer();
        await pc.setLocalDescription(reponse);
        await attendreIce(pc);
        await poster(code, 'reponse', offre.session, pc.localDescription);
        sessionRef.current = offre.session;
      } catch (e) {
        setEtat('perdu');
        setNote(String(e?.message || e));
      }
    },
    [code, fermerPc]
  );

  /* surveillance de la boite aux lettres */
  useEffect(() => {
    if (!code) return undefined;
    vivantRef.current = true;
    depuisRef.current = Date.now();

    let minuteur;
    const tour = async () => {
      if (!vivantRef.current) return;
      try {
        const offre = await lire(code, 'offre');
        if (offre && offre.session !== sessionRef.current) {
          depuisRef.current = Date.now();
          await repondre(offre);
        }
      } catch {
        /* on retentera au prochain tour */
      }
      const age = Date.now() - depuisRef.current;
      const rythme = RYTHMES.find((r) => age < r.avant) || RYTHMES[RYTHMES.length - 1];
      minuteur = setTimeout(tour, pcRef.current?.connectionState === 'connected' ? 15_000 : rythme.delai);
    };
    tour();

    return () => {
      vivantRef.current = false;
      clearTimeout(minuteur);
      fermerPc();
    };
  }, [code, repondre, fermerPc]);

  const activerSon = () => {
    videoRef.current?.play().then(() => setSonBloque(false)).catch(() => {});
  };

  if (!code) {
    return (
      <div className="sv-root sv-saisie">
        <style>{CSS}</style>
        <div className="sv-carte">
          <p className="sv-titre">Code du studio</p>
          <p className="sv-texte">
            Colle ici le code affiche sur le telephone. Il sera retenu sur cet ordinateur.
          </p>
          <input
            className="sv-champ"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value.trim())}
            placeholder="code de 16 caracteres"
            autoFocus
          />
          <button className="sv-bouton" onClick={() => saisie.length >= 8 && setCode(saisie)} type="button">
            Ouvrir la reception
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sv-root">
      <style>{CSS}</style>
      <video ref={videoRef} className="sv-video" autoPlay playsInline />

      {etat !== 'connecte' && (
        <div className="sv-etat">
          <span className={`sv-pastille sv-${etat}`} />
          {etat === 'veille' && 'En attente du telephone'}
          {etat === 'negociation' && 'Connexion en cours'}
          {etat === 'perdu' && 'Flux interrompu, en attente'}
          {note && <em className="sv-note">{note}</em>}
        </div>
      )}

      {sonBloque && (
        <button className="sv-son" onClick={activerSon} type="button">
          Activer le son
        </button>
      )}
    </div>
  );
}

const CSS = `
.sv-root {
  position: fixed; inset: 0; background: transparent; overflow: hidden;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: #f2ede4;
}
.sv-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #000; }
.sv-etat {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; justify-content: center;
  padding: 0.9rem 1.3rem; background: rgba(20, 17, 12, 0.86);
  border: 1px solid rgba(242, 237, 228, 0.16); border-radius: 4px;
  font-size: 0.95rem; text-align: center; max-width: 26rem;
}
.sv-pastille { width: 8px; height: 8px; border-radius: 50%; background: #a79c8c; }
.sv-pastille.sv-negociation { background: #f0a828; }
.sv-pastille.sv-perdu { background: #d2603f; }
.sv-note { flex-basis: 100%; font-size: 0.76rem; color: #a79c8c; font-style: normal; }
.sv-son {
  position: absolute; right: 1rem; bottom: 1rem;
  padding: 0.6rem 0.9rem; background: #f0a828; color: #17140f;
  border: none; border-radius: 3px; font: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer;
}

.sv-saisie { background: #17140f; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
.sv-carte { display: flex; flex-direction: column; gap: 0.8rem; width: min(24rem, 100%); }
.sv-titre { margin: 0; font-size: 1.1rem; }
.sv-texte { margin: 0; font-size: 0.88rem; line-height: 1.5; color: #a79c8c; }
.sv-champ {
  padding: 0.8rem; background: rgba(242, 237, 228, 0.06);
  border: 1px solid rgba(242, 237, 228, 0.16); border-radius: 3px;
  color: #f2ede4; font: inherit; font-size: 0.95rem;
}
.sv-bouton {
  padding: 0.9rem; background: #f0a828; color: #17140f; border: none; border-radius: 3px;
  font: inherit; font-weight: 650; cursor: pointer;
}
`;
