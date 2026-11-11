// Vérifie le mot de passe du club saisi sur l'écran de connexion et ouvre la session (cookie valable un an).
import { jeton, poserCookie, egal } from '../_session.js';

export async function onRequestPost({ request, env }) {
  const json = (corps, status, cookie) => new Response(JSON.stringify(corps), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...(cookie ? { 'Set-Cookie': cookie } : {}) },
  });
  if (!env.MOT_DE_PASSE_MEMBRES) return json({ ok: false, raison: 'mot de passe non réglé' }, 503);
  let motDePasse = '';
  try { ({ motDePasse = '' } = await request.json()); } catch { /* formulaire vide */ }
  const attendu = await jeton(env.MOT_DE_PASSE_MEMBRES);
  const recu = await jeton(motDePasse);
  if (!egal(recu, attendu)) {
    await new Promise((r) => setTimeout(r, 800)); // freine les essais en série
    return json({ ok: false }, 401);
  }
  return json({ ok: true }, 200, poserCookie(attendu));
}
