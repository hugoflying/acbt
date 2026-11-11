// Fiche d'identité de l'appli « Espace membre » : nom, icône et couleurs affichés quand un pilote l'installe sur son téléphone.
import type { APIRoute } from 'astro';
import { url } from '../../lib/utils';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      id: url('/membre/'),
      name: 'ACBT · Espace membre',
      short_name: 'ACBT Pilotes',
      description: "Outils et documents des pilotes de l'aéroclub de Beauvais-Tillé, même sans réseau.",
      lang: 'fr',
      start_url: url('/membre/'),
      scope: url('/membre/'),
      display: 'standalone',
      orientation: 'any',
      background_color: '#f6f2ea',
      theme_color: '#0f1b2d',
      icons: [
        { src: url('/icones/membre-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: url('/icones/membre-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: url('/icones/membre-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } },
  );
