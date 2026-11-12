// Prépare des versions légères (WebP, plusieurs largeurs) de toutes les photos du site vitrine.
// Lancé automatiquement avant chaque construction du site : les photos ajoutées par le back-office
// sont donc allégées toutes seules, sans rien avoir à faire.
// Résultat dans public/opt/ (non versionné) + public/opt/manifeste.json lu par src/lib/photo.ts.
import { readdir, stat, mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const SOURCE = 'public/uploads';
const SORTIE = 'public/opt';
const IGNORER = ['membre', 'documents']; // espace membre et fichiers à télécharger : laissés tels quels
const LARGEURS = [480, 960, 1600];
const QUALITE = 72;

async function lister(dossier) {
  const out = [];
  for (const e of await readdir(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, e.name);
    if (e.isDirectory()) { if (!(dossier === SOURCE && IGNORER.includes(e.name))) out.push(...(await lister(chemin))); }
    else if (/\.(jpe?g|png)$/i.test(e.name)) out.push(chemin);
  }
  return out;
}

const fichiers = await lister(SOURCE);
let ancien = {};
try { ancien = JSON.parse(await readFile(join(SORTIE, 'manifeste.json'), 'utf8')); } catch {}
const manifeste = {};
let faits = 0;

async function traiter(fichier) {
  const cle = '/' + fichier.replace(/^public\//, '').replaceAll('\\', '/');
  // Empreinte du contenu : une photo inchangée n'est jamais retraitée, même après une nouvelle copie du dépôt
  const empreinte = createHash('sha1').update(await readFile(fichier)).digest('hex').slice(0, 16);
  const deja = ancien[cle];
  if (deja && deja.e === empreinte) {
    try { await Promise.all(deja.l.map((l) => stat(join('public', sortie(cle, l))))); manifeste[cle] = deja; return; } catch {}
  }
  try {
    const image = sharp(fichier, { failOn: 'none' }).rotate();
    const meta = await image.metadata();
    const tourne = (meta.orientation ?? 1) >= 5;
    const w = tourne ? meta.height : meta.width, h = tourne ? meta.width : meta.height;
    // Les photos d'actualités (plus d'un millier) n'ont pas besoin de la très grande taille
    const voulues = cle.startsWith('/uploads/actualites/') ? LARGEURS.slice(0, 2) : LARGEURS;
    const largeurs = voulues.filter((l) => l < w);
    if (largeurs.length < voulues.length) largeurs.push(w);
    await mkdir(dirname(join('public', sortie(cle, 0))), { recursive: true });
    for (const l of largeurs) await image.clone().resize({ width: l, withoutEnlargement: true }).webp({ quality: QUALITE }).toFile(join('public', sortie(cle, l)));
    manifeste[cle] = { e: empreinte, w, h, l: largeurs };
    faits++;
  } catch (err) {
    console.warn(`Photo ignorée (${cle}) : ${err.message}`);
  }
}
function sortie(cle, l) { return `/opt${cle.replace(/^\/uploads/, '').replace(extname(cle), '')}-${l}.webp`; }

const file = [...fichiers];
await Promise.all(Array.from({ length: Math.max(2, os.cpus().length) }, async () => { while (file.length) await traiter(file.pop()); }));
await mkdir(SORTIE, { recursive: true });
await writeFile(join(SORTIE, 'manifeste.json'), JSON.stringify(manifeste));
console.log(`Photos allégées : ${faits} préparées, ${Object.keys(manifeste).length - faits} déjà prêtes.`);
