import { defineConfig } from 'astro/config';

// Maquette sur GitHub Pages : https://hugoflying.github.io/acbt/
// Sur Cloudflare Pages avec un domaine propre, mettre SITE_URL et BASE_PATH=/ dans l'environnement de build.
const base = process.env.BASE_PATH ?? '/acbt';

/** Préfixe le sous-dossier de déploiement aux liens et images « /uploads/... » écrits dans le texte des actualités. */
function rehypeBase() {
  const prefix = base.replace(/\/$/, '');
  const walk = (node) => {
    if (node.type === 'element') {
      for (const attr of ['href', 'src']) {
        const v = node.properties?.[attr];
        if (typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && prefix && !v.startsWith(prefix + '/')) {
          node.properties[attr] = prefix + v;
        }
      }
    }
    node.children?.forEach(walk);
  };
  return walk;
}

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://hugoflying.github.io',
  base,
  trailingSlash: 'ignore',
  markdown: { rehypePlugins: [rehypeBase] },
  // Les feuilles de style (quelques Ko) sont écrites dans la page : un aller-retour réseau de moins avant l'affichage.
  build: { inlineStylesheets: 'always' },
});
