// Ferme la session de l'espace membre sur cet appareil.
import { effacerCookie } from '../_session.js';

export const onRequestPost = () => new Response(JSON.stringify({ ok: true }), {
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': effacerCookie() },
});
