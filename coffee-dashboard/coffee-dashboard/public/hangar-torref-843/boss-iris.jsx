// ═══════════════════════════════════════════════════════════
//  Iris de boss — Mame Mame Roast
//  Chargé par index.html AVANT le script principal du jeu.
//  On écrit React.useState / React.useEffect en toutes lettres :
//  le script du jeu déclare déjà const { useState, useEffect, useRef },
//  et redéclarer ces noms ici casserait tout.
// ═══════════════════════════════════════════════════════════

const ART = "https://kissasoko.netlify.app/boss/";

const BOSS_ART = {
  inspecteur: { src: ART + "inspecteur.png", name: "L'INSPECTEUR", sub: "Q-GRADER",
                ringA: "#E3B23C", ringB: "#A85F22", hub: "#1C1408" },
};

// ————— Iris de boss façon générique de cartoon —————
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
  const t = amt > 0 ? 255 : 0, p = Math.abs(amt);
  r = Math.round(r + (t - r) * p); g = Math.round(g + (t - g) * p);
  b = Math.round(b + (t - b) * p);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function BossIris({ src, name, sub, ringA, ringB, hub, onOpen,
                    hole = 21, w = 76, ink = 0, g = 0.5, over = 65, dur = 1300 }) {
  const CX = 500, CY = 480, RMAX = 474, RVL = 75;
  const [reveal, setReveal] = React.useState(0);

  React.useEffect(() => {
    const t0 = performance.now();
    let id;
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      setReveal(RVL * (1 - Math.pow(1 - p, 3)));
      if (p < 1) id = requestAnimationFrame(step);
      else if (onOpen) onOpen();
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, []);

  // Disques empilés, chacun avec son dégradé clair au bord intérieur
  const holeR = hole * 10, rings = [];
  for (let r = RMAX, i = 0; r > holeR + 1; i++) {
    const inner = Math.max(r - w, holeR), base = i % 2 ? ringB : ringA;
    rings.push({ id: `rg${i}`, r, off: inner / r,
                 hi: shade(base, g * 0.55), lo: shade(base, -g * 0.65) });
    r = inner;
  }
  const art = <img src={src} alt="" className="boss-art" />;

  return (
    <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
      <div className="absolute inset-0" style={{ clipPath: `circle(${reveal}% at 50% 48%)` }}>

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
          <circle cx={CX} cy={CY} r={holeR} fill={hub} stroke="#241C17" strokeWidth={ink} />
        </svg>

        <div className="absolute inset-0" style={{ clipPath: `circle(${hole}% at 50% 48%)` }}>
          <div className="boss-slot">{art}</div>
        </div>
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 ${100 - over}% 0)` }}>
          <div className="boss-slot">{art}</div>
        </div>

        <svg viewBox="0 0 1000 1000" className="absolute inset-0" style={{ pointerEvents: "none" }}>
          <defs>
            <path id="arcTop" d="M 140,480 A 360,360 0 0 1 860,480" fill="none" />
            <path id="arcBot" d="M 105,480 A 395,395 0 0 0 895,480" fill="none" />
          </defs>
          <g transform="translate(7,9)" opacity="0.85">
            <text className="iris-name iris-shadow" textAnchor="middle" dx="-5">
              <textPath href="#arcTop" startOffset="50%">{name}</textPath></text>
            <text className="iris-sub iris-shadow" textAnchor="middle" dx="-3">
              <textPath href="#arcBot" startOffset="50%">{sub}</textPath></text>
          </g>
          <text className="iris-name" textAnchor="middle" dx="-5">
            <textPath href="#arcTop" startOffset="50%">{name}</textPath></text>
          <text className="iris-sub" textAnchor="middle" dx="-3">
            <textPath href="#arcBot" startOffset="50%">{sub}</textPath></text>
        </svg>
      </div>
    </div>
  );
}
