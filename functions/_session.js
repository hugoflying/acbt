// Outils partagés par les fonctions Cloudflare de l'espace membre.
// Le mot de passe du club n'est jamais écrit dans le dépôt : il est rangé dans Cloudflare,
// en variable secrète MOT_DE_PASSE_MEMBRES (Réglages du projet Pages > Variables et secrets).

export const COOKIE = 'acbt_membre';
const UN_AN = 60 * 60 * 24 * 365;

/** Jeton de session : empreinte du mot de passe. Changer le mot de passe déconnecte tout le monde. */
export async function jeton(motDePasse) {
  const data = new TextEncoder().encode(`acbt-membre:${String(motDePasse).trim()}`);
  const h = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function lireCookie(request) {
  const c = request.headers.get('Cookie') || '';
  const m = c.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return m ? m[1] : '';
}

export const poserCookie = (valeur) => `${COOKIE}=${valeur}; Path=/; Max-Age=${UN_AN}; HttpOnly; Secure; SameSite=Lax`;
export const effacerCookie = () => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

/** Comparaison à temps constant, pour ne rien laisser deviner du mot de passe. */
export function egal(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
