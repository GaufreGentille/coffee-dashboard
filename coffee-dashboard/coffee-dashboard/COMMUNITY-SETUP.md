# Kissa Soko : Le Comptoir et Veille visuelle

**Branche :** `feature/community-auth-watch` (issue de `legal-and-privacy`).
Ne pas fusionner sans contrôle fonctionnel / sécurité / RGPD.

## Architecture validée
- **Actualités** : flux existants + section *The Sprudge Report*, courts résumés originaux et lien source.
- **Veille** : accès réservé aux membres connectés, y compris le flux Instagram, les épingles, la liste des comptes suivis et les votes ; APIs protégées par jeton Supabase validé côté serveur.
- **Communauté**, dernier univers de la barre de navigation : « Le Comptoir », forum café indépendant.
- **Lecture publique** uniquement pour les autres rubriques et **Communauté**. **Veille privée**. **Écriture authentifiée** (sujets, réponses, votes et signalements).
- L'ancien mot de passe unique `KISSA_PASSWORD` reste réservé aux fonctions privées préexistantes (studio/admin). Ce n'est **pas** un compte de membre.

## Mise en route (à effectuer une fois)
1. Créer un projet dans **Supabase** (Postgres + Auth).
2. Dans **SQL Editor**, exécuter le fichier `supabase/001_community.sql`. Il crée les profils, les sujets, les réponses, les votes, les signalements, les politiques RLS et les fonctions de statistiques publiques.
3. Dans **Netlify > Site configuration > Environment variables**, déclarer `VITE_SUPABASE_URL` (Project URL Supabase) et `VITE_SUPABASE_ANON_KEY` (clé publique / publishable / anon Supabase). Relancer un déploiement, car Vite les intègre au build.
4. Dans **Supabase > Authentication > URL configuration**, définir `Site URL` et ajouter les URLs de redirection autorisées pour la preview Netlify, `https://kissasoko.netlify.app`, puis `https://kissasoko.gg` lorsque le DNS est prêt. Le site utilise automatiquement `window.location.origin` pour les liens d'email.
5. Activer/confirmer le modèle d'email de confirmation dans Supabase Auth et vérifier le fonctionnement inscription, email, connexion, oubli du mot de passe et déconnexion. Utiliser un SMTP adapté avant ouverture publique.
6. Pour autoriser une modération administrative côté base, après création du compte modérateur :
   `insert into public.ks_moderators(user_id) values ('UUID_DU_COMPTE');`
   Les signalements sont accessibles aux modérateurs via la base. **Le panneau de modération est maintenant intégré au Comptoir pour les comptes autorisés**. Il permet de classer les signalements et de supprimer un sujet ou une réponse. Sans compte nommé dans `ks_moderators`, personne ne peut modérer.

### Développement local
Copier `.env.example` en `.env.local`, renseigner les deux variables publiques puis :
```bash
npm install
npm run dev
npm run build
```

Ne **jamais** utiliser de clé Supabase `service_role` ni de secret serveur dans une variable `VITE_*` ou dans GitHub.

## Tests de réception indispensables
- Naviguer sans compte : Actualités/Sprudge et lecture des sujets/réponses restent accessibles ; Veille affiche uniquement son écran de connexion.
- Essayer de publier, commenter ou voter hors connexion : la fenêtre de connexion apparaît et aucune écriture n'a lieu.
- Tester les endpoints `get-insta`, `pins` (GET) et `handles` (GET) sans Authorization : HTTP 401, aucun contenu. Avec un JWT Supabase valide : HTTP 200 et données. Vérifier également la lecture par le script GitHub Actions muni de `VEILLE_SECRET`.
- Créer deux comptes distincts, vérifier un vote par compte et les compteurs, impossibilité pour l'un de modifier/supprimer le contenu de l'autre.
- Tester une réponse imbriquée, un signalement, suppression de son sujet et cascade des réponses.
- Tester filtres/tri, desktop/mobile, états visuels « Hot / Cold » et les liens externes.
- Après déconnexion, vérifier que la Veille ne réapparaît pas à partir du stockage du navigateur et que les requêtes privées restent refusées.
- Tester les politiques RLS **directement** avec le rôle anon, sans faire confiance au seul masquage des boutons React.

## Avant ouverture publique
- Vérifier et mettre à jour Mentions légales, confidentialité, CGU communautaires (publications, modération, signalements, rétention, suppression de compte et données).
- Panneau de modération et limites de fréquence désormais ajoutés avec la migration `supabase/003_moderation_antispam.sql`. **Désigner et tester au moins un modérateur avant ouverture** ; vérifier le circuit de traitement réel. La suppression de compte reste une **demande manuelle par e-mail**, indiquée dans les règles et la confidentialité.
- Paramétrer la protection des inscriptions (CAPTCHA, vérification email, limite de débit), sécurité SMTP et maintenance.
- L'ancien vote `/.netlify/functions/vote` est désormais **fermé (HTTP 410)**. Les votes anonymes précédents restent archivés en Netlify Blobs mais **ne sont pas migrés** car les pseudonymes locaux n'étaient pas vérifiables.
- Les images chargées depuis Instagram/les flux tiers sont **toujours** à examiner dans `MEDIA-AUDIT.md`.
- Pas besoin d'attendre la propagation DNS pour développer ou tester sur Netlify, seulement pour la validation finale du domaine et des emails.

## Périmètre de cette première livraison
Forum fonctionnel après configuration Supabase : inscription/connexion/email, catégories, sujets, réponses (jusqu'à 4 niveaux visibles), votes, signalements et suppression par l'auteur. Lecture publique ; backend protégé par RLS.
Les protections minimales comprennent maintenant une modération des signalements et une limitation serveur de la fréquence des contributions. Les profils avancés, la pagination et les notifications viendront ensuite.

## Suivi du déploiement

- 13 octobre 2026 : Supabase (projet `inansuogvcoivotaopga`) créé en Europe, 7 tables RLS et migrations appliquées.
- Variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` configurées par le propriétaire dans Netlify, toutes les portées y compris `Deploy Previews`.
- Dans Netlify, `main` reste production, `legal-and-privacy` est maintenant autorisée dans `Branch deploys`, et les `Deploy Previews` des pull requests vers les branches autorisées sont activées.
- La PR #2 doit recevoir une prévisualisation distincte avant toute validation visuelle, sans fusion vers `main`.

## Changement Veille privée (octobre 2026)

- Le choix initial « lecture publique de Veille et Communauté » a été remplacé sur demande : **Veille exclusivement pour les membres connectés**, **Communauté librement lisible**.
- Les Functions `get-insta`, `pins` (GET) et `handles` (GET) valident le bearer Supabase côté serveur avec `auth.getUser()`. Les réponses n'utilisent plus de cache public.
- Le collecteur GitHub Actions envoie `x-veille-secret` sur ses appels GET afin de préserver la collecte automatique. Vérifier que le secret `VEILLE_SECRET` est suffisamment long (16 caractères ou plus) et présent dans Netlify et dans les secrets GitHub Actions.
- Le fichier `supabase/002_veille_private.sql` a déjà été appliqué au projet Supabase. Le SQL retire l'accès anonyme aux compteurs `ks_watch_stats`.
- Le contenu Veille n'est plus conservé dans `sessionStorage`. Les images distantes provenant de plateformes tierces restent à examiner dans l'audit médias.
- Ces changements **ne s'appliquent au site public que lorsque les branches seront fusionnées**. À tester d'abord sur `deploy-preview-2--kissasoko.netlify.app`.

## Prépublication : travail ajouté le 15 octobre 2026

- Huit visuels génériques `public/materiel-*.png` ont été récupérés depuis `main` et sont affichés localement dans Matériel selon la catégorie détectée dans les titres/résumés. Les photos distantes ne sont plus utilisées dans cette rubrique.
- Migration `003_moderation_antispam.sql` appliquée à Supabase : statut des signalements, traitement réservé aux modérateurs et limites serveur (sujets : 60 s / 12 par jour ; réponses : 12 s / 120 par jour).
- Le panneau de modération se montre uniquement à un membre reconnu par la fonction `ks_is_moderator()`. Les permissions de base restent le véritable contrôle d'accès.
- Règles communautaires : `/conditions-communaute.html`, lien dans le pied de page et acceptation explicite à l'inscription.
- Confidentialité actualisée pour Supabase Auth, les votes authentifiés, signalements, stockage et demande manuelle d'effacement.
- **Reste à vérifier sur le tableau de bord Supabase (action du propriétaire)** : Authentication → URL Configuration → Site URL `https://kissasoko.gg`, Redirect URLs (incluant le domaine final et la preview), SMTP/confirmation email, CAPTCHA/limites d'inscription, protection des mots de passe compromis si le plan l'autorise.
- **Reste à vérifier** : le compte `contact@kissasoko.gg` reçoit effectivement les demandes de confidentialité/modération ; au moins un compte modérateur est habilité et testé ; création d'un second compte de test, récupération mot de passe, suppression/report, navigation mobile.
- Les images générées sont des illustrations de catégories, pas des photos des produits précis. La source éditoriale et les liens d'origine des articles restent accessibles.
- **Ne pas fusionner automatiquement les PR** avant ces validations fonctionnelles et l'accord de publication du propriétaire. Ordre : PR #1 `legal-and-privacy` → `main`, puis PR #2 `feature/community-auth-watch` → `main` (la base de PR #2 doit être réorientée sur `main` après la première fusion).
