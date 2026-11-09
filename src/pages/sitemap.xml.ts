// Plan du site pour les moteurs de recherche, régénéré à chaque publication.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { url } from '../lib/utils';

export const GET: APIRoute = async ({ site }) => {
  const actus = await getCollection('actualites', (a) => a.data.publie);
  const pages = ['/', '/decouvrir-le-vol/', '/formations/', '/club/', '/club/flotte/', '/club/tarifs/', '/club/historique/', '/actualites/', '/contact/', '/mentions-legales/'];
  const lignes = [
    ...pages.map((p) => `<url><loc>${new URL(url(p), site).href}</loc></url>`),
    ...actus.map((a) => `<url><loc>${new URL(url(`/actualites/${a.id}/`), site).href}</loc><lastmod>${a.data.date.toISOString().slice(0, 10)}</lastmod></url>`),
  ];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lignes.join('\n')}\n</urlset>\n`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
