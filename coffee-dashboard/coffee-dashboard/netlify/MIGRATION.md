# Kissa Soko — passage des flux en blobs planifiés

## 1. Fichiers à supprimer

Ces quatre fichiers sont remplacés par leur équivalent `.mjs`. Il faut les
supprimer, sinon Netlify voit deux functions du même nom et le comportement
devient imprévisible.

```
netlify/functions/get-news.js
netlify/functions/get-science.js
netlify/functions/get-gear.js
netlify/functions/get-sprudge.js
netlify/functions/get-harvest.js
```

`get-markets.js` reste en CommonJS, il est simplement remplacé par la version
fournie ici.

## 2. Fichiers à ajouter

```
netlify/lib/http.mjs          helpers réseau et parsing
netlify/lib/builders.mjs      logique de chaque flux
netlify/lib/feeds.mjs         blobs, cache CDN, corps des crons
netlify/functions/get-news.mjs
netlify/functions/get-science.mjs
netlify/functions/get-gear.mjs
netlify/functions/get-sprudge.mjs
netlify/functions/get-harvest.mjs
netlify/functions/cron-news.mjs
netlify/functions/cron-sprudge.mjs
netlify/functions/cron-gear.mjs
netlify/functions/cron-science.mjs
netlify/functions/cron-harvest.mjs
```

## 3. Dépendances

```bash
npm i @netlify/blobs @netlify/functions
```

`@netlify/blobs` est déjà là si `get-insta.mjs` tourne. `@netlify/functions`
est nécessaire pour `purgeCache`.

## 4. Cadences

Toutes les heures cron sont en **UTC**. En heure de Paris, 05:00 UTC donne
07:00 l'été et 06:00 l'hiver.

| Flux     | Cron          | Fréquence          |
|----------|---------------|--------------------|
| news     | `0 5 * * *`   | tous les matins    |
| sprudge  | `10 5 * * *`  | tous les matins    |
| gear     | `20 5 * * *`  | tous les matins    |
| science  | `30 5 * * *`  | tous les matins    |
| harvest  | `40 5 * * 1`  | tous les lundis    |
| markets  | aucun         | cache CDN 10 min   |

Les crons sont décalés de dix minutes pour ne pas se marcher dessus : chacun
dispose ainsi de sa propre fenêtre de 30 secondes.

## 5. Amorçage

Au premier déploiement, les blobs sont vides. La première visite d'un onglet
déclenche le build en direct, écrit le blob et sert le résultat : lente une
fois, instantanée ensuite. Si tu préfères ne pas laisser cette lenteur à un
visiteur, amorce toi-même après le déploiement :

```bash
for f in news science gear sprudge harvest; do
  curl -s "https://kissasoko.netlify.app/.netlify/functions/get-$f?refresh=1" > /dev/null
  echo "$f amorce"
done
```

## 6. Vérifications

L'en-tête `X-Feed` de la réponse dit d'où vient la donnée :

- `blob` : lecture normale, aucun appel sortant
- `cold` : blob vide, build en direct puis écriture
- `refresh` : rebuild forcé par `?refresh=1`
- `stale` : le build a échoué, l'ancien blob est ressservi

En dev local, `netlify dev` sert les blobs depuis un magasin local.
Pour déclencher un cron à la main : `netlify functions:invoke cron-news`.

## 7. Ce qui a été retiré au passage

**Le proxy POST de `get-news.js`.** Il acceptait n'importe quel prompt envoyé
depuis l'extérieur et le facturait sur `ANTHROPIC_API_KEY`. La traduction des
tuiles Sprudge se fait côté serveur dans `buildSprudge`, ce point d'entrée
n'avait plus de raison d'exister.

**Le prompt `P_CLAUDE`.** Il demandait à Haiku d'écrire des titres de papiers
scientifiques et des fiches produit avec DOI et URLs inventés. Ces champs
n'étaient plus lus depuis la passe 2, et le contenu contrevenait à la règle du
projet sur la donnée inventée.

**Les caches mémoire.** `let cache = null` ne survivait qu'à l'instance lambda
tiède, d'où des temps de réponse imprévisibles selon que l'instance venait
d'être réveillée ou non.

## 8. Points restés en l'état

`dateToMonthIndex` dans `builders.mjs` code en dur 2026 et le premier semestre
2027, et renvoie `6` pour toute date ultérieure. Le calendrier des origines
deviendra donc silencieusement faux à partir de juillet 2027. À reprendre en
index glissant quand tu voudras.

Le champ `generatedAt` est maintenant présent dans toutes les réponses de flux.
Utile pour afficher « mis à jour le… » dans l'interface, si l'envie te prend.
