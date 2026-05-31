import { requireUserId } from "@/lib/session";
import { route } from "@/lib/api";

// Proxies OSRM so we control the upstream and keep the client simple.
export function GET(req: Request) {
  return route(async () => {
    await requireUserId();
    const { searchParams } = new URL(req.url);
    const oLat = Number(searchParams.get("oLat"));
    const oLng = Number(searchParams.get("oLng"));
    const dLat = Number(searchParams.get("dLat"));
    const dLng = Number(searchParams.get("dLng"));

    if ([oLat, oLng, dLat, dLng].some((n) => Number.isNaN(n)))
      throw new Error("Coordenadas inválidas");

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${oLng},${oLat};${dLng},${dLat}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Fuelo/1.0 (fuel tracker app)" },
    });
    if (!res.ok) throw new Error("No se pudo calcular la ruta");

    const data = await res.json();
    const r = data.routes?.[0];
    if (!r) throw new Error("Sin ruta disponible");

    const geometry: [number, number][] = (
      r.geometry?.coordinates ?? []
    ).map((c: [number, number]) => [c[1], c[0]]);

    return {
      distanceKm: Math.round((r.distance / 1000) * 100) / 100,
      durationMin: Math.round(r.duration / 60),
      geometry,
    };
  });
}
