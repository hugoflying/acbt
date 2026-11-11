// Service worker de l'appli « Espace membre » : garde les pages et les documents des pilotes pour qu'ils s'ouvrent sans réseau.
// Il est placé à la racine du site pour pouvoir servir aussi les fichiers de /uploads/membre/,
// mais il ne s'occupe que de l'espace membre : le reste du site fonctionne exactement comme avant.
import type { APIRoute } from 'astro';
import { url } from '../lib/utils';
import { fichiersMembre } from '../lib/membre';

export const GET: APIRoute = async () => {
  const { liste } = await fichiersMembre();
  const conf = {
    version: String(Date.now()),
    racine: url('/'),
    membre: url('/membre/'),
    connexion: url('/membre/connexion/'),
    docs: url('/uploads/membre/'),
    coquille: [url('/membre/'), url('/membre/connexion/'), url('/membre/manifest.webmanifest'), url('/icones/membre-192.png'), url('/icones/membre-512.png'), url('/uploads/logo/logo-acbt.png')],
    fichiers: liste,
  };
  const code = `const C = ${JSON.stringify(conf)};
const APP = 'acbt-membre-app-' + C.version;
const DOCS = 'acbt-membre-docs';

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(APP);
    await cache.addAll(C.coquille);
    // Styles et scripts de la page, pour qu'elle s'affiche correctement hors ligne
    const html = await (await cache.match(C.membre)).text();
    const assets = [...new Set([
      ...[...html.matchAll(/(?:href|src)="([^"]*\\/_astro\\/[^"]+)"/g)].map((m) => m[1]),
      // Photos de la page (en-tête, avions, logos des outils)
      ...[...html.matchAll(/["'(]([^"'()\\s]*\\/uploads\\/(?!membre\\/)[^"'()\\s]+\\.(?:jpe?g|png|webp|svg|gif))/gi)].map((m) => m[1]),
    ])];
    await Promise.all(assets.map((a) => cache.add(a).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('acbt-membre-app-') && k !== APP) await caches.delete(k);
    // On retire les documents qui ne sont plus en ligne
    const docs = await caches.open(DOCS);
    const garder = new Set(C.fichiers.map((f) => new URL(f, self.location).href));
    for (const r of await docs.keys()) if (!garder.has(r.url)) await docs.delete(r);
    await self.clients.claim();
  })());
});

const depuisMembre = (req) => {
  try { return new URL(req.referrer).pathname.startsWith(C.membre); } catch { return false; }
};

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  const ici = u.origin === self.location.origin;

  // Pages de l'espace membre : la version en ligne d'abord, la copie gardée si pas de réseau
  if (req.mode === 'navigate' && ici && u.pathname.startsWith(C.membre)) {
    e.respondWith((async () => {
      try {
        const rep = await fetch(req);
        if (rep.ok && !rep.redirected) (await caches.open(APP)).put(u.pathname, rep.clone());
        return rep;
      } catch {
        return (await caches.match(u.pathname, { ignoreSearch: true })) || (await caches.match(C.membre));
      }
    })());
    return;
  }

  // Documents des pilotes : la copie gardée d'abord (ouverture immédiate, même en vol)
  if (ici && u.pathname.startsWith(C.docs)) {
    e.respondWith((async () => {
      const cache = await caches.open(DOCS);
      const garde = await cache.match(u.pathname);
      if (garde) return garde;
      const rep = await fetch(req);
      if (rep.ok && rep.status === 200 && !req.headers.has('range')) cache.put(u.pathname, rep.clone());
      return rep;
    })());
    return;
  }

  // Styles, scripts (fichiers /_astro/, dont le nom change à chaque version), polices et images utilisés par l'espace membre : copie gardée, rafraîchie en arrière-plan
  if ((ici && (depuisMembre(req) || u.pathname.startsWith(C.racine + '_astro/'))) || /^fonts\\.(googleapis|gstatic)\\.com$/.test(u.hostname)) {
    e.respondWith((async () => {
      const cache = await caches.open(APP);
      const garde = await cache.match(req);
      const frais = fetch(req).then((rep) => { if (rep.ok || rep.type === 'opaque') cache.put(req, rep.clone()); return rep; }).catch(() => garde);
      return garde || frais;
    })());
    return;
  }

  // Photos appelées par une feuille de style (ex. l'en-tête) : la copie gardée seulement si le réseau manque
  if (ici && u.pathname.startsWith(C.racine + 'uploads/')) {
    e.respondWith(fetch(req).catch(async () => (await caches.match(u.pathname)) || Response.error()));
  }
});
`;
  return new Response(code, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
};
