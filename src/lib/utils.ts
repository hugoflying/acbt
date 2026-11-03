const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Lien interne qui tient compte du sous-dossier de déploiement (/acbt sur GitHub Pages). */
export function url(path = '/'): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  return `${base}/${path.replace(/^\//, '')}`;
}

/** Image ou fichier : URL externe telle quelle, sinon fichier du dossier public/. */
export const asset = url;

export function dateFr(d: Date, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) {
  return d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', ...opts }).replace(/^1 /, '1er ');
}

export function euros(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
}

type Tarif = { a_partir_du: Date; prix_heure: number; prix_instruction?: number; note?: string };

/** Tarif en vigueur à une date donnée, et prochain tarif planifié. */
export function tarifEnVigueur(tarifs: Tarif[], ref = new Date()) {
  const tries = [...tarifs].sort((a, b) => a.a_partir_du.getTime() - b.a_partir_du.getTime());
  const actuel = [...tries].reverse().find((t) => t.a_partir_du <= ref);
  const prochain = tries.find((t) => t.a_partir_du > ref);
  return { actuel, prochain, tries };
}
