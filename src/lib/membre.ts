// Réglages communs à l'appli « Espace membre » (pages, service worker et futur contrôle Cloudflare).
import { getCollection } from 'astro:content';
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { url } from './utils';

/** Documents du club déposés sur le site (les liens externes ne sont pas gardés hors ligne). */
export async function fichiersMembre() {
  const docs = (await getCollection('documents')).map((d) => d.data.fichier).filter((f): f is string => !!f && f.startsWith('/uploads/membre/'));
  const uniques = [...new Set(docs)];
  const taille = uniques.reduce((s, f) => {
    try { return s + statSync(join(process.cwd(), 'public', decodeURI(f))).size; } catch { return s; }
  }, 0);
  return { liste: uniques.map((f) => url(f)), taille };
}
