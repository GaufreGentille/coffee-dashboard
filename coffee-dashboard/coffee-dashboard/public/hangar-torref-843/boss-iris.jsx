// ═══════════════════════════════════════════════════════════
//  Iris de boss — Mame Mame Roast
//  Chargé par index.html AVANT le script principal du jeu.
//
//  Chaque boss règle TOUT : géométrie des anneaux, couleurs,
//  taille et espacement du lettrage, taille et respiration du
//  personnage. Ce qui n'est pas précisé prend la valeur par
//  défaut inscrite dans la signature de BossIris plus bas.
//
//  On écrit React.useState / React.useEffect en toutes lettres :
//  le script du jeu déclare déjà const { useState, useEffect, useRef }.
// ═══════════════════════════════════════════════════════════

const ART = "https://kissasoko.netlify.app/boss/";

const BOSS_ART = {

  inspecteur: {
    src: ART + "inspecteur.png",
    name: "L'INSPECTEUR", sub: "Q-GRADER",
    ringA: "#E3B23C", ringB: "#A85F22", hub: "#1C1408",
    hole: 21, w: 76, ink: 0, g: 0.50, over: 65, dur: 1300,
    nameSize: 78, subSize: 64, nameTrack: 10, subTrack: 6,
    charW: 62, charBottom: 0, breatheAmp: 1.0, breatheDur: 800,
  },

  baron: {
    src: ART + "baron.gif",
    name: "LE BARON", sub: "DU VERT",
    ringA: "#E8752A", ringB: "#C7302B", hub: "#1A1310",
    hole: 28, w: 64, ink: 0, g: 0.45, over: 60, dur: 1100,
    nameSize: 84, subSize: 76, nameTrack: 5, subTrack: 16,
    charW: 70, charBottom: 0, breatheAmp: 0.5, breatheDur: 1000,
  },

  // Décommente au fur et à mesure que les visuels arrivent.
  // Un boss absent d'ici retombe proprement sur l'ancien titre
  // en gros : rien ne casse.
  //
  // monstre: {
  //   src: ART + "monstre.png",
  //   name: "MOCHI", sub: "LE KAIJU",
  //   ringA: "#8B57A0", ringB: "#4A2A5C", hub: "#150C1A",
  //   hole: 26, w: 58, ink: 5, g: 0.55, over: 78, dur: 700,
  //   nameSize: 90, subSize: 62, nameTrack: 8, subTrack: 10,
  //   charW: 76, charBottom: 0, breatheAmp: 2.5, breatheDur: 600,
  // },
  //
  // rival: {
  //   src: ART + "rival.png",
  //   name: "LOUIS", sub: "LE RIVAL",
  //   ringA: "#3FA8A0", ringB: "#1D5C63", hub: "#0D1A1C",
  //   hole: 22, w: 70, ink: 3, g: 0.50, over: 62, dur: 900,
  //   nameSize: 88, subSize: 66, nameTrack: 12, subTrack: 8,
  //   charW: 64, charBottom: 2, breatheAmp: 1.5, breatheDur: 900,
  // },
  //
  // decaf: {
  //   src: ART + "decaf.png",
  //   name: "LE", sub: "DÉCAFÉINATEUR",
  //   ringA: "#6E6E7A", ringB: "#2A2A34", hub: "#050308",
  //   hole: 20, w: 40, ink: 6, g: 0.30, over: 70, dur: 2600,
  //   nameSize: 72, subSize: 56, nameTrack: 4, subTrack: 2,
  //   charW: 58, charBottom: 0, breatheAmp: 0.3, breatheDur: 3000,
  // },
};

// Éclaircit (amt > 0) ou assombrit (amt < 0) une couleur hexadécimale
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = amt > 0 ? 255 : 0, p = Math.abs(amt);
  r = Math.round(r + (t - r) * p);
  g = Math.round(g + (t - g) * p);
  b = Math.round(b + (t - b) * p);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function BossIris({
  src, name, sub, onOpen,
  // ————— Anneaux —————
  ringA = "#E3B23C",   // teinte 1, alternée
  ringB = "#A85F22",   // teinte 2, alternée
  hub   = "#1C1408",   // fond derrière le boss
  hole  = 24,          // rayon du trou, en % du côté
  w     = 68,          // épaisseur d'un anneau (1000 = largeur totale)
  ink   = 0,           // trait d'encre entre les anneaux
  g     = 0.50,        // force du dégradé sur chaque anneau
  over  = 65,          // hauteur où le boss passe devant les anneaux
  dur   = 1200,        // durée d'ouverture de l'iris, en ms
  // ————— Lettrage —————
  nameSize  = 80, subSize  = 68,
  nameTrack = 8,  subTrack = 6,
  // ————— Le boss —————
  charW      = 66,     // largeur de l'image, en % du cadre
  charBottom = 0,      // hauteur dans le cadre, en %
  breatheAmp = 1.0,    // amplitude de la respiration, en %
  breatheDur = 900,    // cycle de la respiration, en ms
}) {
  const CX = 500, CY = 480, RMAX = 474, RVL = 75;
  const [reveal, setReveal] = React.useState(0);

  // Un seul cercle révèle toute la composition : anneaux, boss et lettrage.
  React.useEffect(() => {
    const t0 = performance.now();
    let id;
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      setReveal(RVL * (1 - Math.pow(1 - p, 3)));   // easeOutCubic
      if (p < 1) id = requestAnimationFrame(step);
      else if (onOpen) onOpen();
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, []);

  // Disques empilés du plus grand au plus petit, chacun avec son dégradé
  const holeR = hole * 10, rings = [];
  for (let r = RMAX, i = 0; r > holeR + 1; i++) {
    const inner = Math.max(r - w, holeR), base = i % 2 ? ringB : ringA;
    rings.push({ id: `rg${i}`, r, off: inner / r,
                 hi: shade(base, g * 0.55), lo: shade(base, -g * 0.65) });
    r = inner;
  }

  // Les réglages du personnage passent par des variables CSS,
  // lues par les règles de boss-iris.css
  const artStyle = {
    "--char-w": charW + "%",
    "--breathe-amp": (breatheAmp / 100).toFixed(4),
    animationDuration: breatheDur + "ms",
  };
  const art = <img src={src} alt="" className="boss-art" style={artStyle} />;
  const slotStyle = { paddingBottom: charBottom + "%" };

  // Le navigateur ajoute l'espacement après la dernière lettre aussi :
  // on retire la moitié à gauche pour que le texte reste centré sur l'arc.
  const nameStyle = { fontSize: nameSize + "px", strokeWidth: nameSize * 0.16,
                      letterSpacing: nameTrack + "px" };
  const subStyle  = { fontSize: subSize + "px",  strokeWidth: subSize * 0.22,
                      letterSpacing: subTrack + "px" };
  const nameDx = (-nameTrack / 2).toFixed(1);
  const subDx  = (-subTrack / 2).toFixed(1);

  return (
    <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
      <div className="absolute inset-0"
           style={{ clipPath: `circle(${reveal}% at 50% 48%)` }}>

        <svg viewBox="0 0 1000 1000" className="absolute inset-0">
          <defs>{rings.map((q) => (
            <radialGradient key={q.id} id={q.id}>
              <stop offset={q.off} stopColor={q.hi} />
              <stop offset="1" stopColor={q.lo} />
            </radialGradient>))}
          </defs>
          {rings.map((q) => (
            <circle key={q.id} cx={CX} cy={CY} r={q.r} fill={`url(#${q.id})`}
              stroke="#241C17" strokeWidth={ink} />
          ))}
          <circle cx={CX} cy={CY} r={holeR} fill={hub}
            stroke="#241C17" strokeWidth={ink} />
        </svg>

        {/* Le boss, dans le trou */}
        <div className="absolute inset-0"
             style={{ clipPath: `circle(${hole}% at 50% 48%)` }}>
          <div className="boss-slot" style={slotStyle}>{art}</div>
        </div>

        {/* Le haut du boss, par-dessus les anneaux */}
        <div className="absolute inset-0"
             style={{ clipPath: `inset(0 0 ${100 - over}% 0)` }}>
          <div className="boss-slot" style={slotStyle}>{art}</div>
        </div>

        <svg viewBox="0 0 1000 1000" className="absolute inset-0"
             style={{ pointerEvents: "none" }}>
          <defs>
            {/* Haut : gauche → droite par le sommet */}
            <path id="arcTop" d="M 140,480 A 360,360 0 0 1 860,480" fill="none" />
            {/* Bas : sweep-flag à 0, sinon le texte se retrouve à l'envers */}
            <path id="arcBot" d="M 105,480 A 395,395 0 0 0 895,480" fill="none" />
          </defs>
          <g transform="translate(7,9)" opacity="0.85">
            <text className="iris-name iris-shadow" textAnchor="middle"
                  dx={nameDx} style={nameStyle}>
              <textPath href="#arcTop" startOffset="50%">{name}</textPath></text>
            <text className="iris-sub iris-shadow" textAnchor="middle"
                  dx={subDx} style={subStyle}>
              <textPath href="#arcBot" startOffset="50%">{sub}</textPath></text>
          </g>
          <text className="iris-name" textAnchor="middle"
                dx={nameDx} style={nameStyle}>
            <textPath href="#arcTop" startOffset="50%">{name}</textPath></text>
          <text className="iris-sub" textAnchor="middle"
                dx={subDx} style={subStyle}>
            <textPath href="#arcBot" startOffset="50%">{sub}</textPath></text>
        </svg>
      </div>
    </div>
  );
}
