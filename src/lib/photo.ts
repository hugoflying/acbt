// Photos allégées : scripts/optimiser-images.mjs prépare des versions WebP en plusieurs largeurs,
// et ces fonctions donnent au navigateur la bonne taille selon l'écran.
// Si une photo n'a pas (encore) de version allégée, on sert simplement l'originale.
import { readFileSync } from 'node:fs';
import { asset } from './utils';

type Entree = { w: number; h: number; l: number[] };
let manifeste: Record<string, Entree> = {};
try { manifeste = JSON.parse(readFileSync('public/opt/manifeste.json', 'utf8')); } catch { /* pas de versions allégées : originales */ }

const variante = (src: string, l: number) => encodeURI(asset(`/opt${src.replace(/^\/uploads/, '').replace(/\.[^.]+$/, '')}-${l}.webp`));

/** Attributs à poser sur une balise img : <img {...photo(chemin, '(min-width: 900px) 33vw, 100vw')} alt="" />. */
export function photo(src: string | undefined, sizes = '100vw') {
  const e = src ? manifeste[src] : undefined;
  if (!src || !e) return { src: src ? asset(src) : undefined };
  const defaut = e.l.find((l) => l >= 960) ?? e.l[e.l.length - 1];
  return { src: variante(src, defaut), srcset: e.l.map((l) => `${variante(src, l)} ${l}w`).join(', '), sizes };
}

/** Adresse d'une seule version allégée (fonds en CSS, préchargement). */
export function photoUrl(src: string | undefined, largeur = 1600) {
  const e = src ? manifeste[src] : undefined;
  if (!src || !e) return src ? asset(src) : '';
  return variante(src, e.l.find((l) => l >= largeur) ?? e.l[e.l.length - 1]);
}
