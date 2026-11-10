// METAR de LFOB récupéré au moment de la construction du site (clé AVWX gardée secrète dans GitHub).
export interface Metar {
  raw: string;
  regles: string; // VFR, MVFR, IFR, LIFR
  heure: string; // ISO
  vent: string;
  visibilite: string;
  nuages: string;
  temperature?: number;
  rosee?: number;
  qnh?: number;
}

// Clé publique (site maquette) : aussi utilisée par le navigateur pour rafraîchir le METAR entre deux publications.
export const AVWX_CLE = 'v1k-d7EgXdAiRybNQZ6gij20qSs0n9DEPki8lQD0jjo';

let cache: Promise<Metar | null> | undefined;

async function charger(station: string): Promise<Metar | null> {
  // Clé AVWX laissée en clair à la demande du club (site maquette). Le secret GitHub AVWX_TOKEN reste prioritaire.
  const token = process.env.AVWX_TOKEN || AVWX_CLE;
  if (!token) return null;
  try {
    const r = await fetch(`https://avwx.rest/api/metar/${station}?options=&format=json&onfail=cache`, {
      headers: { Authorization: `BEARER ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return null;
    const m = await r.json();
    const dir = m.wind_direction?.repr === 'VRB' ? 'variable' : m.wind_direction?.value != null ? `${String(m.wind_direction.value).padStart(3, '0')}°` : '';
    const force = m.wind_speed?.value ?? 0;
    const vent = force === 0 ? 'calme' : `${dir} ${force} kt${m.wind_gust?.value ? `, rafales ${m.wind_gust.value} kt` : ''}`;
    const visi = m.visibility?.repr === 'CAVOK' || /CAVOK/.test(m.raw ?? '') ? 'CAVOK' : m.visibility?.value != null ? (m.visibility.value >= 9999 ? '10 km et plus' : `${m.visibility.value} m`) : '';
    const nuages = (m.clouds ?? []).map((c: { type: string; altitude: number }) => `${c.type} ${c.altitude * 100} ft`).join(', ') || (visi === 'CAVOK' ? 'aucun nuage significatif' : 'pas de nuages signalés');
    return {
      raw: m.raw,
      regles: m.flight_rules ?? '',
      heure: m.time?.dt ?? '',
      vent: vent.trim(),
      visibilite: visi,
      nuages,
      temperature: m.temperature?.value ?? undefined,
      rosee: m.dewpoint?.value ?? undefined,
      qnh: m.altimeter?.value ?? undefined,
    };
  } catch {
    return null;
  }
}

export function metar(station = 'LFOB') {
  return (cache ??= charger(station));
}
