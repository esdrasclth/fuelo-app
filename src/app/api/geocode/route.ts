import { requireUserId } from "@/lib/session";
import { route } from "@/lib/api";

export interface GeocodeResult {
  label: string;
  lat: number;
  lng: number;
}

// Proxies Nominatim so we can set a compliant User-Agent and avoid CORS.
export function GET(req: Request) {
  return route(async () => {
    await requireUserId();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    if (q.length < 3) return [] as GeocodeResult[];

    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6` +
      `&accept-language=es&q=${encodeURIComponent(q)}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Fuelo/1.0 (fuel tracker app)" },
    });
    if (!res.ok) throw new Error("No se pudo buscar el lugar");

    const data = (await res.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
    }>;

    return data.map(
      (d): GeocodeResult => ({
        label: d.display_name,
        lat: Number(d.lat),
        lng: Number(d.lon),
      }),
    );
  });
}
