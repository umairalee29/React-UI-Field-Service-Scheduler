const EARTH_RADIUS_KM = 6371;

export function haversineDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export async function nominatimGeocode(address: string): Promise<[number, number] | null> {
  try {
    const query = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'DispatchIQ/1.0 (field-service-scheduler)' },
    });

    if (!res.ok) return null;

    const results = (await res.json()) as NominatimResult[];
    if (!results[0]) return null;

    const { lon, lat } = results[0];
    return [parseFloat(lon), parseFloat(lat)];
  } catch {
    return null;
  }
}
