import { useState, useRef, useEffect, useCallback } from 'react';
import {
  obtenirIceServers,
  poster,
  lire,
  effacer,
  attendreIce,
  nouvelleSession,
  genererCode,
  codeMemorise,
  memoriserCode,
  lireStats,
} from '../studio/lien';

/**
 * StudioCam
 * Page emetteur du studio Kissa Soko.
 * Tourne sur le telephone, capte la camera arriere et le micro,
 * et tient le flux pret a etre publie en WebRTC.
 *
 * Etape 1 : capture, permissions, veille, profils, arbitrage adaptatif.
 * La signalisation et la publication arrivent a l'etape suivante :
 * elles consommeront le MediaStream et les parametres d'encodage
 * remontes par onStreamReady et onProfilChange.
 */

export const PROFILS = [
  {
    id: 'auto',
    label: 'Auto',
    detail: 'part en 1080p30 et suit le reseau',
    w: 1920, h: 1080, fps: 30,
    bitrateMax: 4_500_000,
    adaptatif: true,
  },
  { id: '720p30', label: '720p30', detail: 'le plus stable en mobilite', w: 1280, h: 720, fps: 30, bitrateMax: 2_500_000 },
  { id: '720p60', label: '720p60', detail: 'mouvement fluide, definition sobre', w: 1280, h: 720, fps: 60, bitrateMax: 4_000_000 },
  { id: '1080p30', label: '1080p30', detail: 'detail fin sur plan pose', w: 1920, h: 1080, fps: 30, bitrateMax: 4_500_000 },
  { id: '1080p60', label: '1080p60', detail: 'rarement expose aux pages web', w: 1920, h: 1080, fps: 60, bitrateMax: 7_000_000 },
  { id: '1440p30', label: '1440p30', detail: 'marge pour recadrer dans OBS', w: 2560, h: 1440, fps: 30, bitrateMax: 6_500_000 },
];

const BITRATE_PLANCHER = 500_000;

/** Modes testes par la sonde, du plus leger au plus exigeant. */
const MODES_SONDE = [
  { label: '720p30', w: 1280, h: 720, fps: 30 },
  { label: '720p60', w: 1280, h: 720, fps: 60 },
  { label: '1080p30', w: 1920, h: 1080, fps: 30 },
  { label: '1080p60', w: 1920, h: 1080, fps: 60 },
  { label: '1440p30', w: 2560, h: 1440, fps: 30 },
  { label: '2160p30', w: 3840, h: 2160, fps: 30 },
];

export const ARBITRAGES = [
  { id: 'maintain-framerate', label: 'Fluidite', detail: 'garde la cadence, baisse la definition' },
  { id: 'maintain-resolution', label: 'Nettete', detail: 'garde la definition, lache des images' },
  { id: 'balanced', label: 'Equilibre', detail: 'repartit la baisse sur les deux' },
];

/**
 * Parametres a poser sur le RTCRtpSender a l'etape publication.
 * sender.setParameters({ ...params, encodings: [encodage], degradationPreference: arbitrage })
 */
export function parametresEncodage(profil, arbitrage) {
  return {
    encodings: [
      {
        maxBitrate: profil.bitrateMax,
        minBitrate: BITRATE_PLANCHER,
        maxFramerate: profil.fps,
        scaleResolutionDownBy: 1,
        networkPriority: 'high',
        priority: 'high',
      },
    ],
    degradationPreference: arbitrage,
  };
}

export default function StudioCam({ onStreamReady, onProfilChange }) {
  const [phase, setPhase] = useState('idle'); // idle | starting | ready | error
  const [erreur, setErreur] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [cameraActive, setCameraActive] = useState(null);
  const [profilId, setProfilId] = useState('auto');
  const [arbitrage, setArbitrage] = useState('maintain-framerate');
  const [reglages, setReglages] = useState(null);
  const [capacites, setCapacites] = useState(null);
  const [ecart, setEcart] = useState(null);
  const [torch, setTorch] = useState(false);
  const [zoom, setZoom] = useState(null);
  const [niveauAudio, setNiveauAudio] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const [veilleActive, setVeilleActive] = useState(false);
  const [panneauOuvert, setPanneauOuvert] = useState(false);
  const [bascule, setBascule] = useState(false);
  const [sonde, setSonde] = useState(null);
  const [code, setCode] = useState(() => codeMemorise() || '');
  const [etatLien, setEtatLien] = useState('inactif'); // inactif | appel | connecte | echec
  const [noteLien, setNoteLien] = useState(null);
  const [statsLien, setStatsLien] = useState(null);
  const [codeCopie, setCodeCopie] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const wakeLockRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);
  const pcRef = useRef(null);
  const sessionRef = useRef(null);
  const statsRef = useRef(null);

  const profil = PROFILS.find((p) => p.id === profilId) || PROFILS[0];

  /* ---------- orientation ---------- */
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const maj = () => setPortrait(mq.matches);
    maj();
    mq.addEventListener('change', maj);
    return () => mq.removeEventListener('change', maj);
  }, []);

  /* ---------- veille ecran ---------- */
  const prendreWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setVeilleActive(true);
      wakeLockRef.current.addEventListener('release', () => setVeilleActive(false));
    } catch {
      setVeilleActive(false);
    }
  }, []);

  useEffect(() => {
    const surVisibilite = () => {
      if (document.visibilityState === 'visible' && streamRef.current) prendreWakeLock();
    };
    document.addEventListener('visibilitychange', surVisibilite);
    return () => document.removeEventListener('visibilitychange', surVisibilite);
  }, [prendreWakeLock]);

  /* ---------- vumetre ---------- */
  const brancherVumetre = useCallback((stream) => {
    // un nouveau flux veut un nouvel analyseur : l'ancien mesurait une piste morte
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setNiveauAudio(0);
    const piste = stream.getAudioTracks()[0];
    if (!piste) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    audioCtxRef.current = ctx;
    const analyseur = ctx.createAnalyser();
    analyseur.fftSize = 1024;
    ctx.createMediaStreamSource(stream).connect(analyseur);
    const tampon = new Float32Array(analyseur.fftSize);

    const boucle = () => {
      analyseur.getFloatTimeDomainData(tampon);
      let somme = 0;
      for (let i = 0; i < tampon.length; i++) somme += tampon[i] * tampon[i];
      const rms = Math.sqrt(somme / tampon.length);
      const db = 20 * Math.log10(rms || 1e-8);
      const norm = Math.max(0, Math.min(1, (db + 60) / 60));
      setNiveauAudio((prec) => (norm > prec ? norm : prec * 0.86 + norm * 0.14));
      rafRef.current = requestAnimationFrame(boucle);
    };
    boucle();
  }, []);

  /* ---------- lecture des capacites ---------- */
  const lireCapacites = useCallback((piste) => {
    const caps = typeof piste.getCapabilities === 'function' ? piste.getCapabilities() : null;
    setCapacites(caps);
    if (caps?.zoom) setZoom(piste.getSettings().zoom ?? caps.zoom.min);
  }, []);

  const contraintesVideo = useCallback((p, deviceId, exigeant) => {
    const base = {
      width: { ideal: p.w },
      height: { ideal: p.h },
      // en mode exigeant on impose un plancher : le navigateur doit obeir
      // ou refuser franchement, ce qui vaut mieux qu'une promesse non tenue
      frameRate: exigeant && !p.adaptatif ? { min: p.fps - 2, ideal: p.fps } : { ideal: p.fps },
    };
    return deviceId ? { ...base, deviceId: { exact: deviceId } } : { ...base, facingMode: { ideal: 'environment' } };
  }, []);

  /* ---------- verification de ce qu'on a vraiment obtenu ---------- */
  const verifierEcart = useCallback((p) => {
    const piste = streamRef.current?.getVideoTracks()[0];
    if (!piste) return;
    const s = piste.getSettings();
    setReglages(s);
    const fpsReel = s.frameRate ? Math.round(s.frameRate) : null;
    // en portrait la largeur et la hauteur sont inversees : on compare le petit cote
    const petitCote = s.width && s.height ? Math.min(s.width, s.height) : null;
    const manques = [];
    if (petitCote && petitCote < p.h) manques.push(`${petitCote}p au lieu de ${p.h}p`);
    if (fpsReel && fpsReel < p.fps - 5) manques.push(`${fpsReel} fps au lieu de ${p.fps}`);
    setEcart(manques.length && !p.adaptatif ? `Ton appareil livre ${manques.join(' et ')}.` : null);
  }, []);

  /* ---------- capture ---------- */
  const demarrer = useCallback(
    async (deviceId, p = profil) => {
      setPhase('starting');
      setErreur(null);
      setEcart(null);

      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        const audio = {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: { ideal: 1 },
          sampleRate: { ideal: 48000 },
        };

        let stream;
        let replie = false;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: contraintesVideo(p, deviceId, true),
            audio,
          });
        } catch (dur) {
          if (dur?.name !== 'OverconstrainedError') throw dur;
          replie = true;
          stream = await navigator.mediaDevices.getUserMedia({
            video: contraintesVideo(p, deviceId, false),
            audio,
          });
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        // diffusion en cours : on substitue les pistes sans renegocier,
        // le PC ne voit qu'un bref arret sur image au lieu d'un ecran noir
        if (pcRef.current) {
          const emetteurs = pcRef.current.getSenders();
          for (const piste of stream.getTracks()) {
            const e = emetteurs.find((x) => x.track?.kind === piste.kind);
            if (e) await e.replaceTrack(piste);
          }
          await appliquerEncodage(p, arbitrage);
        }

        const pisteVideo = stream.getVideoTracks()[0];
        lireCapacites(pisteVideo);
        setCameraActive(pisteVideo.getSettings().deviceId ?? null);
        setTorch(false);

        const liste = await navigator.mediaDevices.enumerateDevices();
        setCameras(liste.filter((d) => d.kind === 'videoinput'));

        brancherVumetre(stream);
        await prendreWakeLock();
        setPhase('ready');
        if (replie) {
          setEcart(`Ton appareil a refuse ${p.fps} images par seconde en ${p.h}p. Il n'expose pas ce mode.`);
        } else {
          setTimeout(() => verifierEcart(p), 1400);
        }

        if (onStreamReady) onStreamReady(stream, parametresEncodage(p, arbitrage));
      } catch (e) {
        setPhase('error');
        setErreur(messageErreur(e));
      }
    },
    [profil, arbitrage, contraintesVideo, lireCapacites, brancherVumetre, prendreWakeLock, verifierEcart, onStreamReady]
  );

  /* ---------- changement de profil en cours de session ---------- */
  const changerProfil = useCallback(
    async (id) => {
      const p = PROFILS.find((x) => x.id === id);
      setProfilId(id);
      if (phase !== 'ready') return;

      const piste = streamRef.current?.getVideoTracks()[0];
      if (!piste) return;
      setBascule(true);
      setEcart(null);

      // changer de cadence demande un autre mode capteur : applyConstraints
      // ne suffit presque jamais, on relance la piste directement
      const fpsCourant = Math.round(piste.getSettings().frameRate || 0);
      if (!p.adaptatif && Math.abs(fpsCourant - p.fps) > 5) {
        await demarrer(cameraActive, p);
        setBascule(false);
        if (onProfilChange) onProfilChange(parametresEncodage(p, arbitrage));
        return;
      }

      try {
        await piste.applyConstraints({
          width: { ideal: p.w },
          height: { ideal: p.h },
          frameRate: { ideal: p.fps },
        });
        setTimeout(() => verifierEcart(p), 1400);
      } catch {
        // certains appareils refusent le changement a chaud : on relance la piste
        await demarrer(cameraActive, p);
      } finally {
        setBascule(false);
      }
      if (onProfilChange) onProfilChange(parametresEncodage(p, arbitrage));
    },
    [phase, arbitrage, cameraActive, demarrer, verifierEcart, onProfilChange]
  );

  const changerArbitrage = useCallback(
    (id) => {
      setArbitrage(id);
      appliquerEncodage(profil, id);
      if (onProfilChange) onProfilChange(parametresEncodage(profil, id));
    },
    [profil, onProfilChange, appliquerEncodage]
  );

  /* ---------- telemetrie ---------- */
  useEffect(() => {
    if (phase !== 'ready') return;
    const id = setInterval(() => {
      const piste = streamRef.current?.getVideoTracks()[0];
      if (piste) setReglages(piste.getSettings());
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  /* ---------- publication ---------- */
  const appliquerEncodage = useCallback(async (p, arb) => {
    const pc = pcRef.current;
    if (!pc) return;
    const emetteur = pc.getSenders().find((s) => s.track?.kind === 'video');
    if (!emetteur) return;
    const params = emetteur.getParameters();
    if (!params.encodings?.length) params.encodings = [{}];
    Object.assign(params.encodings[0], parametresEncodage(p, arb).encodings[0]);
    params.degradationPreference = arb;
    try {
      await emetteur.setParameters(params);
    } catch {
      // Safari refuse encore degradationPreference : on garde au moins le plafond
      delete params.degradationPreference;
      try {
        await emetteur.setParameters(params);
      } catch {
        /* tant pis */
      }
    }
  }, []);

  const couperDiffusion = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    sessionRef.current = null;
    statsRef.current = null;
    setStatsLien(null);
    setEtatLien('inactif');
    setNoteLien(null);
  }, []);

  const diffuser = useCallback(async () => {
    if (!streamRef.current || !code) return;
    setEtatLien('appel');
    setNoteLien(null);
    pcRef.current?.close();

    try {
      const { iceServers, relais, motif } = await obtenirIceServers();
      if (!relais) setNoteLien(`relais indisponible (${motif || 'inconnu'})`);

      const pc = new RTCPeerConnection({ iceServers, bundlePolicy: 'max-bundle' });
      pcRef.current = pc;
      streamRef.current.getTracks().forEach((t) => pc.addTrack(t, streamRef.current));
      await appliquerEncodage(profil, arbitrage);

      pc.onconnectionstatechange = () => {
        if (pcRef.current !== pc) return;
        const e = pc.connectionState;
        if (e === 'connected') setEtatLien('connecte');
        else if (e === 'failed' || e === 'closed') {
          setEtatLien('echec');
          setNoteLien('connexion perdue');
        }
      };

      const offre = await pc.createOffer();
      await pc.setLocalDescription(offre);
      await attendreIce(pc);

      const session = nouvelleSession();
      sessionRef.current = session;
      await effacer(code, 'reponse'); // ne pas relire une vieille reponse
      await poster(code, 'offre', session, pc.localDescription);

      const debut = Date.now();
      while (Date.now() - debut < 45_000) {
        await new Promise((r) => setTimeout(r, 1500));
        if (pcRef.current !== pc) return;
        const rep = await lire(code, 'reponse');
        if (rep && rep.session === session) {
          await pc.setRemoteDescription(rep.sdp);
          return;
        }
      }
      setEtatLien('echec');
      setNoteLien("le PC n'a pas repondu. La page de reception est-elle ouverte ?");
    } catch (e) {
      setEtatLien('echec');
      setNoteLien(String(e?.message || e));
    }
  }, [code, profil, arbitrage, appliquerEncodage]);

  /* releve du debit reel une fois connecte */
  useEffect(() => {
    if (etatLien !== 'connecte') return undefined;
    const id = setInterval(async () => {
      const pc = pcRef.current;
      if (!pc) return;
      const s = await lireStats(pc, statsRef.current);
      if (s) {
        statsRef.current = s;
        setStatsLien(s);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [etatLien]);

  /* ---------- sonde des modes reellement disponibles ---------- */
  const lancerSonde = useCallback(async () => {
    setSonde({ enCours: true, resultats: [] });
    const resultats = [];
    const etaitOuverte = !!streamRef.current;
    const deviceId = cameraActive;

    // la camera ne peut pas etre ouverte deux fois sur iOS
    if (etaitOuverte) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      await new Promise((r) => setTimeout(r, 400));
    }

    for (const m of MODES_SONDE) {
      const video = {
        width: { exact: m.w },
        height: { exact: m.h },
        frameRate: { exact: m.fps },
        ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: 'environment' } }),
      };
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video, audio: false });
        const r = s.getVideoTracks()[0].getSettings();
        const fps = Math.round(r.frameRate || 0);
        const petitCote = Math.min(r.width || 0, r.height || 0);
        // Safari accepte la demande puis livre autre chose : on juge sur le resultat
        const tenu = petitCote >= m.h && fps >= m.fps - 5;
        resultats.push({
          label: m.label,
          ok: tenu,
          reel: tenu ? `${petitCote}p ${fps} fps` : `livre ${petitCote}p ${fps} fps`,
        });
        s.getTracks().forEach((t) => t.stop());
      } catch (e) {
        resultats.push({ label: m.label, ok: false, reel: e?.name === 'OverconstrainedError' ? 'non expose' : e?.name });
      }
      setSonde({ enCours: true, resultats: [...resultats] });
      await new Promise((r) => setTimeout(r, 300));
    }

    setSonde({ enCours: false, resultats });
    if (etaitOuverte) await demarrer(deviceId);
  }, [cameraActive, demarrer]);

  const basculerTorch = useCallback(async () => {
    const piste = streamRef.current?.getVideoTracks()[0];
    if (!piste || !capacites?.torch) return;
    const cible = !torch;
    try {
      await piste.applyConstraints({ advanced: [{ torch: cible }] });
      setTorch(cible);
    } catch {
      /* refus en cours de session sur certains appareils */
    }
  }, [torch, capacites]);

  const appliquerZoom = useCallback(async (valeur) => {
    const piste = streamRef.current?.getVideoTracks()[0];
    if (!piste) return;
    setZoom(valeur);
    try {
      await piste.applyConstraints({ advanced: [{ zoom: valeur }] });
    } catch {
      /* ignore */
    }
  }, []);

  const arreter = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    sessionRef.current = null;
    setEtatLien('inactif');
    setStatsLien(null);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
    setVeilleActive(false);
    setPhase('idle');
    setNiveauAudio(0);
    setEcart(null);
  }, []);

  useEffect(() => arreter, [arreter]);

  const cameraSuivante = useCallback(() => {
    if (cameras.length < 2) return;
    const i = cameras.findIndex((c) => c.deviceId === cameraActive);
    demarrer(cameras[(i + 1) % cameras.length].deviceId);
  }, [cameras, cameraActive, demarrer]);

  const audioOk = niveauAudio > 0.02;
  const fpsReel = reglages?.frameRate ? Math.round(reglages.frameRate) : null;
  const petitCote = reglages?.width && reglages?.height ? Math.min(reglages.width, reglages.height) : null;
  const modeRefuse = (id) => {
    const r = sonde?.resultats?.find((x) => x.label === id);
    return r ? !r.ok : false;
  };

  return (
    <div className="sc-root">
      <style>{CSS}</style>

      <video ref={videoRef} className="sc-video" autoPlay playsInline muted />

      {phase !== 'ready' && (
        <div className="sc-accueil">
          <div className="sc-marque">
            <span className="sc-marque-jp">喫茶倉庫</span>
            <span className="sc-marque-fr">studio</span>
          </div>

          {phase === 'error' && <p className="sc-erreur">{erreur}</p>}

          <p className="sc-intro">
            Cette page transforme ton telephone en camera. Rien ne part tant que tu n'as
            pas lance la diffusion.
          </p>

          <div className="sc-profils">
            {PROFILS.map((p) => (
              <button
                key={p.id}
                className={`sc-profil ${profilId === p.id ? 'est-actif' : ''} ${modeRefuse(p.id) ? 'est-refuse' : ''}`}
                onClick={() => setProfilId(p.id)}
                disabled={modeRefuse(p.id)}
                type="button"
              >
                <strong>{p.label}</strong>
                <span>{modeRefuse(p.id) ? 'non expose par cet appareil' : p.detail}</span>
              </button>
            ))}
          </div>

          <div className="sc-groupe">
            <p className="sc-titre-groupe">Code du studio</p>
            {code ? (
              <div className="sc-code">
                <span>{code}</span>
                <button
                  className="sc-lien"
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(code);
                    setCodeCopie(true);
                    setTimeout(() => setCodeCopie(false), 1500);
                  }}
                >
                  {codeCopie ? 'copie' : 'copier'}
                </button>
              </div>
            ) : (
              <button
                className="sc-action"
                type="button"
                onClick={() => {
                  const c = genererCode();
                  setCode(c);
                  memoriserCode(c);
                }}
              >
                Generer un code
              </button>
            )}
            <p className="sc-aide">
              C'est lui qui relie le telephone au PC. Saisis le une fois sur la page de
              reception, il sera retenu des deux cotes.
            </p>
          </div>

          <button className="sc-demarrer" onClick={() => demarrer(null)} disabled={phase === 'starting'} type="button">
            {phase === 'starting' ? 'Ouverture de la camera' : 'Ouvrir la camera'}
          </button>

          <p className="sc-note">
            Sur iPhone, garde Safari au premier plan. L'ecran mis en veille coupe la capture.
          </p>
        </div>
      )}

      {phase === 'ready' && (
        <>
          <div className="sc-barre-haut">
            <span className="sc-etat">
              <i className="sc-point" />
              {petitCote ? `${petitCote}p` : '...'}
              {fpsReel ? `${fpsReel}` : ''}
            </span>
            <div className="sc-vumetre" aria-label="niveau du micro">
              <i style={{ transform: `scaleX(${niveauAudio})` }} />
            </div>
            {!audioOk && <span className="sc-alerte">micro silencieux</span>}
            <button className="sc-icone" onClick={() => setPanneauOuvert((v) => !v)} type="button">
              {panneauOuvert ? 'Fermer' : 'Reglages'}
            </button>
          </div>

          {portrait && <div className="sc-orientation">Tourne le telephone a l'horizontale pour cadrer en 16:9</div>}

          {panneauOuvert && (
            <div className="sc-panneau">
              <div className="sc-groupe">
                <p className="sc-titre-groupe">Profil</p>
                <div className="sc-pastilles">
                  {PROFILS.map((p) => (
                    <button
                      key={p.id}
                      className={`sc-pastille ${profilId === p.id ? 'est-actif' : ''} ${modeRefuse(p.id) ? 'est-refuse' : ''}`}
                      onClick={() => changerProfil(p.id)}
                      disabled={bascule || modeRefuse(p.id)}
                      type="button"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sc-groupe">
                <p className="sc-titre-groupe">Quand le reseau faiblit</p>
                <div className="sc-pastilles">
                  {ARBITRAGES.map((a) => (
                    <button
                      key={a.id}
                      className={`sc-pastille ${arbitrage === a.id ? 'est-actif' : ''}`}
                      onClick={() => changerArbitrage(a.id)}
                      type="button"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                <p className="sc-aide">{ARBITRAGES.find((a) => a.id === arbitrage)?.detail}</p>
              </div>

              {ecart && <p className="sc-ecart">{ecart}</p>}

              <div className="sc-groupe">
                <div className="sc-ligne-titre">
                  <p className="sc-titre-groupe">Modes reellement exposes</p>
                  <button className="sc-lien" onClick={lancerSonde} disabled={sonde?.enCours} type="button">
                    {sonde?.enCours ? 'test en cours' : 'Sonder'}
                  </button>
                </div>
                {sonde?.resultats?.length > 0 && (
                  <ul className="sc-sonde">
                    {sonde.resultats.map((r) => (
                      <li key={r.label} className={r.ok ? 'est-ok' : 'est-ko'}>
                        <span>{r.label}</span>
                        <span>{r.reel}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {sonde && !sonde.enCours && (
                  <p className="sc-aide">La camera se rouvre automatiquement a la fin du test.</p>
                )}
              </div>

              <dl className="sc-infos">
                <div>
                  <dt>Capture</dt>
                  <dd>{petitCote ? `${petitCote}p` : '...'}</dd>
                </div>
                <div>
                  <dt>Cadence</dt>
                  <dd>{fpsReel ? `${fpsReel} fps` : '...'}</dd>
                </div>
                <div>
                  <dt>Plafond</dt>
                  <dd>{(profil.bitrateMax / 1_000_000).toFixed(1)} Mbps</dd>
                </div>
                <div>
                  <dt>Veille</dt>
                  <dd>{veilleActive ? 'bloquee' : 'libre'}</dd>
                </div>
              </dl>

              {capacites?.zoom && (
                <label className="sc-champ">
                  <span>Zoom</span>
                  <input
                    type="range"
                    min={capacites.zoom.min}
                    max={capacites.zoom.max}
                    step={capacites.zoom.step || 0.1}
                    value={zoom ?? capacites.zoom.min}
                    onChange={(e) => appliquerZoom(parseFloat(e.target.value))}
                  />
                </label>
              )}

              <div className="sc-actions">
                {cameras.length > 1 && (
                  <button className="sc-action" onClick={cameraSuivante} type="button">
                    Changer d'objectif
                  </button>
                )}
                {capacites?.torch && (
                  <button className={`sc-action ${torch ? 'est-actif' : ''}`} onClick={basculerTorch} type="button">
                    {torch ? 'Eteindre la lampe' : 'Allumer la lampe'}
                  </button>
                )}
                <button className="sc-action sc-action-sortie" onClick={arreter} type="button">
                  Fermer la camera
                </button>
              </div>
            </div>
          )}

          <div className="sc-barre-bas">
            <button
              className={`sc-diffuser ${etatLien === 'connecte' ? 'est-en-direct' : ''}`}
              type="button"
              disabled={!code || etatLien === 'appel'}
              onClick={etatLien === 'inactif' || etatLien === 'echec' ? diffuser : couperDiffusion}
            >
              {etatLien === 'inactif' && 'Lancer la diffusion'}
              {etatLien === 'appel' && 'Connexion au PC'}
              {etatLien === 'connecte' && 'Arreter la diffusion'}
              {etatLien === 'echec' && 'Reessayer'}
            </button>
            {statsLien?.debit ? (
              <span className="sc-attente">
                {(statsLien.debit / 1_000_000).toFixed(1)} Mbps envoyes
                {statsLien.hauteur ? ` en ${Math.min(statsLien.largeur, statsLien.hauteur)}p` : ''}
                {statsLien.fps ? ` a ${Math.round(statsLien.fps)} fps` : ''}
                {statsLien.limite && statsLien.limite !== 'none' ? ` (bride par ${statsLien.limite})` : ''}
              </span>
            ) : (
              <span className="sc-attente">{noteLien || (code ? 'pret' : 'genere un code avant de diffuser')}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function messageErreur(e) {
  switch (e?.name) {
    case 'NotAllowedError':
      return "Acces refuse. Autorise la camera et le micro dans les reglages du navigateur, puis recharge la page.";
    case 'NotFoundError':
      return "Aucune camera detectee sur cet appareil.";
    case 'NotReadableError':
      return "La camera est deja utilisee par une autre application. Ferme la, puis reessaie.";
    case 'OverconstrainedError':
      return "Cette camera ne gere pas ce profil. Passe en 720p30.";
    default:
      return `La camera n'a pas demarre (${e?.name || 'erreur inconnue'}).`;
  }
}

const CSS = `
.sc-root {
  --sc-fond: #17140f;
  --sc-voile: rgba(20, 17, 12, 0.82);
  --sc-trait: rgba(242, 237, 228, 0.16);
  --sc-texte: #f2ede4;
  --sc-doux: #a79c8c;
  --sc-ambre: #f0a828;
  --sc-vif: #4bd07a;
  position: fixed;
  inset: 0;
  background: var(--sc-fond);
  color: var(--sc-texte);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  overflow: hidden;
  -webkit-user-select: none;
  user-select: none;
}
.sc-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: #000; }

.sc-accueil {
  position: relative; z-index: 2; height: 100%;
  display: flex; flex-direction: column; justify-content: center; gap: 1.3rem;
  padding: 2rem 1.6rem calc(2rem + env(safe-area-inset-bottom));
  background: var(--sc-fond); max-width: 34rem; margin: 0 auto;
  overflow-y: auto;
}
.sc-marque { display: flex; align-items: baseline; gap: 0.6rem; }
.sc-marque-jp { font-size: 1.5rem; letter-spacing: 0.18em; color: var(--sc-ambre); }
.sc-marque-fr { font-size: 0.95rem; color: var(--sc-doux); letter-spacing: 0.05em; }
.sc-intro { margin: 0; font-size: 1rem; line-height: 1.55; color: var(--sc-doux); }
.sc-erreur {
  margin: 0; padding: 0.9rem 1rem;
  border-left: 3px solid var(--sc-ambre); background: rgba(240, 168, 40, 0.09);
  font-size: 0.95rem; line-height: 1.5;
}
.sc-profils { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
.sc-profils > :first-child { grid-column: 1 / -1; }
.sc-profil {
  display: flex; flex-direction: column; gap: 0.15rem;
  padding: 0.75rem 0.7rem;
  background: transparent; border: 1px solid var(--sc-trait); border-radius: 3px;
  color: var(--sc-doux); font: inherit; text-align: left; cursor: pointer;
}
.sc-profil strong { font-size: 0.98rem; color: var(--sc-texte); font-weight: 600; font-variant-numeric: tabular-nums; }
.sc-profil span { font-size: 0.72rem; line-height: 1.3; }
.sc-profil.est-refuse { opacity: 0.42; cursor: not-allowed; }
.sc-pastille.est-refuse { opacity: 0.35; text-decoration: line-through; }
.sc-profil.est-actif { border-color: var(--sc-ambre); background: rgba(240, 168, 40, 0.1); }
.sc-demarrer {
  padding: 1.15rem; background: var(--sc-ambre); color: #17140f;
  border: none; border-radius: 3px; font: inherit; font-size: 1.05rem; font-weight: 650; cursor: pointer;
}
.sc-demarrer:disabled { opacity: 0.55; }
.sc-note { margin: 0; font-size: 0.82rem; line-height: 1.5; color: var(--sc-doux); opacity: 0.8; }

.sc-barre-haut {
  position: absolute; top: 0; left: 0; right: 0; z-index: 3;
  display: flex; align-items: center; gap: 0.7rem;
  padding: calc(0.6rem + env(safe-area-inset-top)) 0.9rem 0.6rem;
  background: linear-gradient(to bottom, rgba(10, 8, 5, 0.78), transparent);
  font-size: 0.82rem;
}
.sc-etat { display: flex; align-items: center; gap: 0.4rem; white-space: nowrap; font-variant-numeric: tabular-nums; }
.sc-point { width: 7px; height: 7px; border-radius: 50%; background: var(--sc-vif); flex: none; }
.sc-vumetre { flex: 1; height: 3px; background: rgba(242, 237, 228, 0.18); border-radius: 2px; overflow: hidden; }
.sc-vumetre i { display: block; height: 100%; background: var(--sc-vif); transform-origin: left; transition: transform 60ms linear; }
.sc-alerte { color: var(--sc-ambre); white-space: nowrap; }
.sc-icone {
  background: var(--sc-voile); border: 1px solid var(--sc-trait); border-radius: 3px;
  color: var(--sc-texte); font: inherit; font-size: 0.8rem; padding: 0.45rem 0.7rem; cursor: pointer;
}

.sc-orientation {
  position: absolute; z-index: 3; left: 50%; top: 50%; transform: translate(-50%, -50%);
  padding: 0.8rem 1.1rem; background: var(--sc-voile); border: 1px solid var(--sc-trait);
  border-radius: 3px; font-size: 0.88rem; text-align: center; max-width: 18rem; line-height: 1.45;
}

.sc-panneau {
  position: absolute; z-index: 4;
  top: calc(3.2rem + env(safe-area-inset-top)); right: 0.9rem;
  width: min(21rem, calc(100% - 1.8rem));
  max-height: calc(100% - 8rem); overflow-y: auto;
  padding: 1rem; background: var(--sc-voile); backdrop-filter: blur(14px);
  border: 1px solid var(--sc-trait); border-radius: 4px;
  display: flex; flex-direction: column; gap: 1rem;
}
.sc-groupe { display: flex; flex-direction: column; gap: 0.45rem; }
.sc-titre-groupe { margin: 0; font-size: 0.75rem; color: var(--sc-doux); }
.sc-pastilles { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.sc-pastille {
  padding: 0.45rem 0.65rem; background: transparent;
  border: 1px solid var(--sc-trait); border-radius: 3px;
  color: var(--sc-doux); font: inherit; font-size: 0.82rem; cursor: pointer;
  font-variant-numeric: tabular-nums;
}
.sc-pastille.est-actif { border-color: var(--sc-ambre); color: var(--sc-ambre); background: rgba(240, 168, 40, 0.1); }
.sc-pastille:disabled { opacity: 0.4; }
.sc-aide { margin: 0; font-size: 0.75rem; color: var(--sc-doux); line-height: 1.4; }
.sc-ecart {
  margin: 0; padding: 0.6rem 0.7rem; font-size: 0.78rem; line-height: 1.45;
  border-left: 2px solid var(--sc-ambre); background: rgba(240, 168, 40, 0.08); color: var(--sc-texte);
}
.sc-ligne-titre { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; }
.sc-lien {
  background: none; border: none; padding: 0; cursor: pointer;
  color: var(--sc-ambre); font: inherit; font-size: 0.78rem; text-decoration: underline;
}
.sc-lien:disabled { color: var(--sc-doux); text-decoration: none; }
.sc-sonde { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.2rem; }
.sc-sonde li {
  display: flex; justify-content: space-between; gap: 0.8rem;
  font-size: 0.78rem; font-variant-numeric: tabular-nums;
  padding: 0.3rem 0.4rem; border-left: 2px solid transparent; background: rgba(242, 237, 228, 0.04);
}
.sc-sonde li.est-ok { border-left-color: var(--sc-vif); }
.sc-sonde li.est-ko { border-left-color: rgba(242, 237, 228, 0.2); color: var(--sc-doux); }
.sc-infos { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem 1.2rem; margin: 0; }
.sc-infos dt { font-size: 0.72rem; color: var(--sc-doux); margin: 0 0 0.15rem; }
.sc-infos dd { margin: 0; font-size: 0.92rem; font-variant-numeric: tabular-nums; }
.sc-champ { display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.8rem; color: var(--sc-doux); }
.sc-champ input { width: 100%; accent-color: var(--sc-ambre); }
.sc-code {
  display: flex; align-items: center; justify-content: space-between; gap: 0.6rem;
  padding: 0.7rem 0.8rem; background: rgba(242, 237, 228, 0.06);
  border: 1px solid var(--sc-trait); border-radius: 3px;
}
.sc-code span { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9rem; letter-spacing: 0.04em; word-break: break-all; }
.sc-diffuser.est-en-direct { background: #d2603f; color: #fff; }
.sc-actions { display: flex; flex-direction: column; gap: 0.45rem; }
.sc-action {
  padding: 0.7rem; background: transparent; border: 1px solid var(--sc-trait); border-radius: 3px;
  color: var(--sc-texte); font: inherit; font-size: 0.88rem; cursor: pointer;
}
.sc-action.est-actif { border-color: var(--sc-ambre); color: var(--sc-ambre); }
.sc-action-sortie { color: var(--sc-doux); }

.sc-barre-bas {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 3;
  display: flex; flex-direction: column; align-items: center; gap: 0.45rem;
  padding: 1rem 1rem calc(1.2rem + env(safe-area-inset-bottom));
  background: linear-gradient(to top, rgba(10, 8, 5, 0.8), transparent);
}
.sc-diffuser {
  width: min(22rem, 100%); padding: 1.05rem;
  background: var(--sc-ambre); color: #17140f; border: none; border-radius: 3px;
  font: inherit; font-size: 1rem; font-weight: 650; cursor: pointer;
}
.sc-diffuser:disabled { background: rgba(242, 237, 228, 0.14); color: var(--sc-doux); cursor: default; }
.sc-attente { font-size: 0.75rem; color: var(--sc-doux); }

button:focus-visible { outline: 2px solid var(--sc-ambre); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .sc-vumetre i { transition: none; } }
`;
