import { defineConfig } from 'astro/config';

// Maquette sur GitHub Pages : https://hugoflying.github.io/acbt/
// Sur Cloudflare Pages avec un domaine propre, mettre SITE_URL et BASE_PATH=/ dans l'environnement de build.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://hugoflying.github.io',
  base: process.env.BASE_PATH ?? '/acbt',
  trailingSlash: 'ignore',
});
