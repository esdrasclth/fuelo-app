export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  label: string;
  lat: number;
  lng: number;
}

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][];
}

export async function geocode(q: string): Promise<GeocodeResult[]> {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchRoute(
  origin: LatLng,
  dest: LatLng,
): Promise<RouteResult> {
  const params = new URLSearchParams({
    oLat: String(origin.lat),
    oLng: String(origin.lng),
    dLat: String(dest.lat),
    dLng: String(dest.lng),
  });
  const res = await fetch(`/api/route?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "No se pudo calcular la ruta");
  return data;
}
