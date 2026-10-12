# Kissa Soko — registre média

Dernière mise à jour : 12 octobre 2026

Ce document sert de registre interne de provenance et de droits. Il ne remplace pas un avis juridique.
Statuts :
- ✅ provenance/droit suffisamment documenté pour l'usage actuel
- 🟠 usage plausible mais provenance, licence ou conditions à confirmer
- 🔴 action requise avant une ouverture/monétisation plus large

## 1. Identité visuelle et créations Kissa Soko

| Fichiers | Usage | Provenance connue | Statut | Action |
| --- | --- | --- | --- | --- |
| `playlist-kagemusha.jpg`, `playlist-midnight.jpg`, `playlist-sakura.jpg` | Covers playlists | Créations via IA, confirmé par GG | ✅ / 🟠 | Conserver une note interne du service IA utilisé si possible |
| `grain.mp4`, `grain-poster.webp` | Animation hero / reveal | Création via IA, confirmé par GG | ✅ / 🟠 | Conserver une note interne du service IA utilisé si possible |
| `kissa-hero-botanical.png`, `kissa-bottom-botanical.png` | Ornements botaniques | Créations du projet, provenance exacte à documenter | 🟠 | Confirmer outil/source de génération |
| `kissa-soko-logo.png`, `gg-logo.png`, `logo.png`, `favicon.svg` | Identité de marque | Projet Kissa Soko, provenance exacte à documenter | 🟠 | Confirmer que tous les éléments sont originaux ou sous licence compatible |
| `tiles/*.png` | Tuiles de navigation | Provenance exacte non documentée | 🟠 | Confirmer création interne / IA / source |
| `boss/*.png`, `boss/baron.gif` | Mame Mame Roast | Visuels du projet, provenance exacte à documenter | 🟠 | Confirmer création interne / IA et outil utilisé |
| `cupping-logo.png` | Outil de cupping | Provenance exacte non documentée | 🟠 | Confirmer |
| `vitality-logo.webp` | Référence Team Vitality | Marque/logo tiers | 🟠 | Garder uniquement dans un contexte éditorial/référentiel, sans suggérer de partenariat |

## 2. Musiques de Mame Mame Roast

Fichiers audités :
- `public/music/boss-*.mp3`
- `public/music/era1-*.mp3`
- `public/music/era2-*.mp3`
- `public/music/era3-*.mp3`
- `public/music/meta-transcendance.mp3`
- `public/music/titre.mp3`
- `public/music/victoire.mp3`

Provenance de travail : morceaux générés avec Suno pour le projet.

Statut : **🟠 à documenter avant toute monétisation**.

À enregistrer pour chaque morceau ou pour le lot :
1. compte/créateur d'origine ;
2. date approximative de génération ;
3. formule Suno utilisée au moment de la génération ou du téléchargement ;
4. statut du téléchargement autorisant ou non l'usage commercial ;
5. absence de sample, voix ou upload tiers non autorisé.

Pour l'usage actuel du site comme projet personnel/non professionnel, ne pas présenter ces morceaux comme appartenant à un tiers. Avant Ko-fi, sponsoring, vente, publicité ou autre monétisation, vérifier les droits commerciaux du lot.

## 3. Fiches CVA — Specialty Coffee Association

| Fichier | Statut | Note |
| --- | --- | --- |
| `outils/cva/sca-cva-complet-fr.pdf` | ✅ | Document SCA redistribuable sans modification selon sa notice |
| `outils/cva/sca-cva-complet-en.pdf` | ✅ | Document SCA redistribuable sans modification selon sa notice |
| `outils/cva/sca-cva-descriptif-fr.pdf` | ✅ | Extraction de la page descriptive, contenu SCA non modifié |
| `outils/cva/sca-cva-descriptif-en.pdf` | ✅ | Extraction de la page descriptive, contenu SCA non modifié |

Ne pas modifier le contenu des fiches. Afficher clairement la source SCA dans l'interface.

## 4. Tasse imparfaite — images embarquées

### Éléments déjà identifiables

| Fichier | Contexte | Statut | Action |
| --- | --- | --- | --- |
| `rId40.png` | Roue des arômes, Annexe E | ✅ | Le texte du livre l'identifie comme « Création originale » |
| `rId36.png`, `rId37.png` | Courbes / schémas acrylamide, Annexe B | 🟠 | Probablement schémas de travail ; confirmer s'ils ont été créés par GG |
| `rId30.png` à `rId33.png` | Figures moléculaires, chapitre Défauts | 🟠 | Si provenance inconnue, remplacer facilement par des schémas originaux |
| `rId34.png`, `rId35.jpg` | Photos/illustrations défauts café vert / moldy | 🔴 | Provenance inconnue ; crédit/licence à retrouver ou remplacer |
| `rId10.png` à `rId14.png` | Histoire, cartes / diffusion / génétique | 🔴 | Provenance inconnue ; crédit/licence à retrouver ou remplacer |
| `rId15.png`, `rId17.png` à `rId29.png` | Process café | 🔴 | Provenance inconnue ; crédit/licence à retrouver ou remplacer |

### Média volontairement retiré

`rId16.png` était une figure du process lavé supprimée volontairement par GG car elle ne convenait pas visuellement. La référence résiduelle dans le HTML a été retirée afin d'éviter une image cassée.

## 5. Images éditoriales chargées depuis des sites tiers

### Actualités et Matériel

Le parseur RSS récupère actuellement une URL d'image fournie par les flux externes (`media:content`, `media:thumbnail`, `enclosure` ou image du contenu) et le navigateur l'affiche directement depuis le serveur d'origine.

Sources concernées notamment :
- Perfect Daily Grind
- Sprudge
- Daily Coffee News
- Barista Magazine
- SCA News
- CoffeeGeek

Statut : **🟠 / 🔴 à sécuriser**.

Risques à traiter :
- droits photographiques distincts du droit de citer le titre/résumé ;
- hotlink vers l'hébergeur tiers ;
- requête directe du visiteur vers le domaine tiers ;
- retrait ou changement de l'image à la source.

Option la plus prudente : ne pas afficher de photo RSS tierce sans autorisation/licence explicite et utiliser une illustration Kissa Soko neutre ou une carte textuelle. Une autre option est de conserver uniquement les sources dont les conditions autorisent explicitement l'affichage des vignettes.

### Veille Instagram

Les médias Instagram sont servis à partir des données renvoyées par l'API Meta Business Discovery et renvoient vers les publications d'origine.

Statut : **🟠**.

À vérifier lors de la passe dédiée Meta :
- exigences d'affichage/attribution de l'API ;
- durée de conservation des URLs/médias ;
- comportement lorsqu'une publication ou un compte est supprimé ;
- lien systématique vers la publication originale.

## 6. Dépendances média externes dans Mame Mame Roast

La page du jeu charge encore des ressources externes :
- React / ReactDOM depuis unpkg ;
- Babel depuis unpkg ;
- Tailwind CDN ;
- Google Fonts / Google Fonts static.

Elle référence aussi encore des URLs `kissasoko.netlify.app/music/` et `kissasoko.netlify.app/boss/`.

Statut : **🟠 technique / confidentialité**.

Action recommandée :
- rendre les chemins music/boss relatifs ;
- retirer Google Fonts du jeu comme cela a été fait pour le site principal ;
- idéalement bundler/localiser les dépendances CDN si le jeu devient une partie durable du site.

## 7. Priorités avant publication élargie

1. 🔴 Identifier ou remplacer les images inconnues de *Tasse imparfaite*, en priorité les photos et cartes.
3. 🟠 Documenter le statut Suno des musiques.
4. 🟠 Décider quoi faire des vignettes RSS tierces.
5. 🟠 Faire une passe dédiée sur les médias Instagram / conditions Meta.
6. 🟠 Nettoyer les dépendances externes du jeu.
7. ✅ Garder le registre à jour à chaque nouvel ajout média.
