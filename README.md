# Site de l'Aéroclub de Beauvais-Tillé (ACBT)

Maquette du nouveau site, qui regroupe l'ancien site (acbt60.free.fr) et le site Wix.
En ligne sur **https://hugoflying.github.io/acbt/** une fois GitHub Pages activé.

## Mettre à jour le site sans rien installer (back-office)

1. Aller sur **https://app.pagescms.org** et se connecter avec son compte GitHub
   (le compte doit avoir accès au dépôt `hugoflying/acbt`).
2. Choisir le dépôt `acbt`, branche `main`.
3. Le menu de gauche donne accès à :
   - **Actualités** : ajouter un article, ses photos, le dépublier.
   - **Flotte et tarifs avions** : ajouter ou retirer un avion, ses photos, ses tarifs.
   - **Documents de l'espace membre** : déposer ou supprimer un PDF.
   - **Infos du club**, **Baptêmes**, **Outils de préparation des vols**, **Historique**.
4. Cliquer sur **Save** : le site se republie tout seul en 1 à 2 minutes.

### Planifier un changement de tarif

Dans la fiche d'un avion, ajouter une ligne de tarif avec une date future dans
« Applicable à partir du ». L'ancien tarif reste affiché jusqu'à cette date, puis le nouveau
prend le relais automatiquement : le site se republie chaque nuit.

### Retirer un avion

Décocher « Avion affiché sur le site » pour le masquer en gardant sa fiche, ou le supprimer.

## Pour les développeurs

- [Astro](https://astro.build) 5, site 100 % statique. `npm install` puis `npm run dev`.
- Contenus : `src/content/` (actualités en Markdown, avions et documents en YAML)
  et `src/data/` (JSON). Le schéma est dans `src/content.config.ts`, le back-office dans `.pages.yml`.
- Déploiement : `.github/workflows/deploy.yml` publie sur GitHub Pages à chaque push sur `main`
  et chaque nuit. Pour Cloudflare Pages : commande `npm run build`, dossier `dist`,
  variables `BASE_PATH=/` et `SITE_URL=https://votre-domaine`.
- Animations : GSAP + Lenis dans `src/scripts/motion.ts`, pilotées par des attributs HTML
  (`data-split`, `data-reveal`, `data-stagger`, `data-count`, `data-parallax`, `data-clip`, `data-marquee`).
  Coupées automatiquement si le visiteur a demandé à réduire les animations.
- Espace membre : `/membre` est public dans la maquette. En production, le protéger avec
  Cloudflare Access (règle sur le chemin `/membre*`, connexion par code e-mail).

## Reste à faire

- Récupérer et classer les actualités 2006-2020 de l'ancien site.
- Télécharger les photos hébergées sur Wix dans `public/uploads/` (elles sont liées en direct pour l'instant).
- Vérifier les tarifs saisis à partir de la grille 2025.
