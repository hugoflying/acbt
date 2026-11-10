// Consignes pour les moteurs de recherche : tout le site est public sauf l'espace membre.
import type { APIRoute } from 'astro';
import { url } from '../lib/utils';

export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nDisallow: ${url('/membre/')}\nDisallow: ${url('/admin/')}\n\nSitemap: ${new URL(url('/sitemap.xml'), site).href}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
