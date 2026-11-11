// Réglages communs à l'appli « Espace membre » (pages, service worker et futur contrôle Cloudflare).
import { getCollection } from 'astro:content';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { url } from './utils';

/**
 * Documents du club déposés sur le site (les liens externes ne sont pas gardés hors ligne).
 * Chaque adresse porte l'empreinte du fichier (?v=…) : si un document est remplacé sous le même nom,
 * l'appli le voit et met à jour sa copie hors ligne.
 */
export async function fichiersMembre() {
  const docs = (await getCollection('documents')).map((d) => d.data.fichier).filter((f): f is string => !!f && f.startsWith('/uploads/membre/'));
  let taille = 0;
  const liste = [...new Set(docs)].map((f) => {
    try {
      const contenu = readFileSync(join(process.cwd(), 'public', decodeURI(f)));
      taille += contenu.length;
      return `${url(f)}?v=${createHash('sha1').update(contenu).digest('hex').slice(0, 10)}`;
    } catch { return url(f); }
  });
  return { liste, taille };
}

/** Numéro de version de l'appli : change à chaque modification du site, pas aux republications automatiques. */
export function versionAppli(fichiers: string[]) {
  const commit = process.env.GITHUB_SHA || process.env.CF_PAGES_COMMIT_SHA || String(Date.now());
  return createHash('sha1').update(commit + fichiers.join()).digest('hex').slice(0, 12);
}
