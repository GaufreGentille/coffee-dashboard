# Kissa Soko : Le Comptoir et Veille visuelle

**Branche :** `feature/community-auth-watch` (issue de `legal-and-privacy`).
Ne pas fusionner sans contrôle fonctionnel / sécurité / RGPD.

## Architecture validée
- **Actualités** : flux existants + section *The Sprudge Report*, courts résumés originaux et lien source.
- **Veille visuelle** : l'ancien panneau Instagram et ses épingles, lisible librement ; votes réservés aux comptes.
- **Communauté**, dernier univers de la barre de navigation : « Le Comptoir », forum café indépendant.
- **Lecture anonyme** autorisée partout. **Écriture authentifiée** (sujets, réponses, votes et signalements).
- L'ancien mot de passe unique `KISSA_PASSWORD` reste réservé aux fonctions privées préexistantes (studio/admin). Ce n'est **pas** un compte de membre.

## Mise en route (à effectuer une fois)
1. Créer un projet dans **Supabase** (Postgres + Auth).
2. Dans **SQL Editor**, exécuter le fichier `supabase/001_community.sql`. Il crée les profils, les sujets, les réponses, les votes, les signalements, les politiques RLS et les fonctions de statistiques publiques.
3. Dans **Netlify > Site configuration > Environment variables**, déclarer `VITE_SUPABASE_URL` (Project URL Supabase) et `VITE_SUPABASE_ANON_KEY` (clé publique / publishable / anon Supabase). Relancer un déploiement, car Vite les intègre au build.
4. Dans **Supabase > Authentication > URL configuration**, définir `Site URL` et ajouter les URLs de redirection autorisées pour la preview Netlify, `https://kissasoko.netlify.app`, puis `https://kissasoko.gg` lorsque le DNS est prêt. Le site utilise automatiquement `window.location.origin` pour les liens d'email.
5. Activer/confirmer le modèle d'email de confirmation dans Supabase Auth et vérifier le fonctionnement inscription, email, connexion, oubli du mot de passe et déconnexion. Utiliser un SMTP adapté avant ouverture publique.
6. Pour autoriser une modération administrative côté base, après création du compte modérateur :
   `insert into public.ks_moderators(user_id) values ('UUID_DU_COMPTE');`
   Les signalements sont accessibles aux modérateurs via la base. **L'interface de modération reste à développer avant ouverture au public**.

### Développement local
Copier `.env.example` en `.env.local`, renseigner les deux variables publiques puis :
```bash
npm install
npm run dev
npm run build
```

Ne **jamais** utiliser de clé Supabase `service_role` ni de secret serveur dans une variable `VITE_*` ou dans GitHub.

## Tests de réception indispensables
- Naviguer sans compte : Actualités/Sprudge, Veille et lecture des sujets/réponses restent accessibles.
- Essayer de publier, commenter ou voter hors connexion : la fenêtre de connexion apparaît et aucune écriture n'a lieu.
- Créer deux comptes distincts, vérifier un vote par compte et les compteurs, impossibilité pour l'un de modifier/supprimer le contenu de l'autre.
- Tester une réponse imbriquée, un signalement, suppression de son sujet et cascade des réponses.
- Tester filtres/tri, desktop/mobile et les liens externes.
- Tester les politiques RLS **directement** avec le rôle anon, sans faire confiance au seul masquage des boutons React.

## Avant ouverture publique
- Vérifier et mettre à jour Mentions légales, confidentialité, CGU communautaires (publications, modération, signalements, rétention, suppression de compte et données).
- Prévoir une interface de modération et un circuit de retrait des contenus, antispam/limites de requêtes, signalements, et suppression de compte/données.
- Paramétrer la protection des inscriptions (CAPTCHA, vérification email, limite de débit), sécurité SMTP et maintenance.
- L'ancien vote `/.netlify/functions/vote` est désormais **fermé (HTTP 410)**. Les votes anonymes précédents restent archivés en Netlify Blobs mais **ne sont pas migrés** car les pseudonymes locaux n'étaient pas vérifiables.
- Les images chargées depuis Instagram/les flux tiers sont **toujours** à examiner dans `MEDIA-AUDIT.md`.
- Pas besoin d'attendre la propagation DNS pour développer ou tester sur Netlify, seulement pour la validation finale du domaine et des emails.

## Périmètre de cette première livraison
Forum fonctionnel après configuration Supabase : inscription/connexion/email, catégories, sujets, réponses (jusqu'à 4 niveaux visibles), votes, signalements et suppression par l'auteur. Lecture publique ; backend protégé par RLS.
Ce n'est pas encore une version prête à ouvrir au grand public. La modération complète, l'antispam, les profils avancés, la pagination et les notifications viendront ensuite.

## Suivi du déploiement

- 13 octobre 2026 : Supabase (projet `inansuogvcoivotaopga`) créé en Europe, 7 tables RLS et migrations appliquées.
- Variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` configurées par le propriétaire dans Netlify, toutes les portées y compris `Deploy Previews`.
- Dans Netlify, `main` reste production, `legal-and-privacy` est maintenant autorisée dans `Branch deploys`, et les `Deploy Previews` des pull requests vers les branches autorisées sont activées.
- La PR #2 doit recevoir une prévisualisation distincte avant toute validation visuelle, sans fusion vers `main`.
