/* ═══════════════════════════════════════════════
   Iris de boss — Mame Mame Roast

   Ce fichier ne contient plus QUE le squelette.
   Toutes les valeurs (tailles, espacements, vitesse
   de respiration) viennent de boss-iris.jsx, boss
   par boss. Tu ne devrais plus avoir à y toucher.
   ═══════════════════════════════════════════════ */

/* Emplacement du personnage — le padding vient de charBottom */
.boss-slot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* La largeur et l'amplitude viennent des variables posées par le composant */
.boss-art {
  width: var(--char-w, 66%);
  transform-origin: 50% 100%;
  animation-name: breathe;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  /* animation-duration est fixée par boss, en style inline */
}

@keyframes breathe {
  0%, 100% {
    transform: scaleY(calc(1 - var(--breathe-amp, 0.01)))
               scaleX(calc(1 + var(--breathe-amp, 0.01) * 0.6));
  }
  50% {
    transform: scaleY(calc(1 + var(--breathe-amp, 0.01)))
               scaleX(calc(1 - var(--breathe-amp, 0.01) * 0.6));
  }
}

/* Lettrage : seule la police et le contour sont communs.
   Taille, épaisseur et espacement sont posés par boss. */
.iris-name, .iris-sub {
  font-family: "Luckiest Guy", Impact, sans-serif;
  fill: #F5E9C8;
  stroke: #241C17;
  paint-order: stroke fill;   /* le contour passe derrière le remplissage */
}

/* Ombre portée : même texte, décalé et sombre, dessiné en dessous */
.iris-shadow {
  fill: #241C17;
  stroke: #241C17;
}

@media (prefers-reduced-motion: reduce) {
  .boss-art { animation: none; }
}
