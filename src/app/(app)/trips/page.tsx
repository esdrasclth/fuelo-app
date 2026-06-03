"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Route as RouteIcon,
  Search,
  MapPin,
  Flag,
  Loader2,
  Trash2,
  Fuel,
  Clock,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useVehicles } from "@/hooks/use-vehicles";
import { useFuelLogs } from "@/hooks/use-fuel-logs";
import { useTrips, useTripMutations } from "@/hooks/use-trips";
import { computeFuelStats, estimateTripCost } from "@/lib/metrics";
import {
  geocode,
  fetchRoute,
  type LatLng,
  type GeocodeResult,
} from "@/lib/geo";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-settings";
import type { Trip } from "@/lib/types";

const TripMap = dynamic(() => import("@/components/trip-map"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-[var(--radius)] bg-muted animate-pulse" />
  ),
});

type Point = { coord: LatLng; label: string } | null;

export default function TripsPage() {
  const { data: vehicles } = useVehicles();
  const { data: logs } = useFuelLogs();
  const { data: trips } = useTrips();
  const currency = useCurrency();
  const { create, remove } = useTripMutations();

  const [origin, setOrigin] = useState<Point>(null);
  const [dest, setDest] = useState<Point>(null);
  const [pickMode, setPickMode] = useState<"origin" | "dest">("origin");

  const [oQuery, setOQuery] = useState("");
  const [dQuery, setDQuery] = useState("");
  const [oResults, setOResults] = useState<GeocodeResult[]>([]);
  const [dResults, setDResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState<"origin" | "dest" | null>(null);

  const [geometry, setGeometry] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const [routing, setRouting] = useState(false);

  const [vehicleId, setVehicleId] = useState("");
  const [roundTrip, setRoundTrip] = useState(false);
  const [name, setName] = useState("");

  const allStats = useMemo(() => computeFuelStats(logs ?? []), [logs]);
  const vehicleStats = useMemo(
    () =>
      computeFuelStats(
        (logs ?? []).filter((l) => !vehicleId || l.vehicleId === vehicleId),
      ),
    [logs, vehicleId],
  );

  const [manualKmPerL, setManualKmPerL] = useState("");
  const [price, setPrice] = useState("");

  const kmPerL =
    vehicleStats.avgKmPerL ?? (Number(manualKmPerL) || 0);
  const pricePerLiter =
    Number(price) || allStats.lastPricePerLiter || 0;

  const estimate = useMemo(() => {
    if (!distanceKm || kmPerL <= 0 || pricePerLiter <= 0) return null;
    return estimateTripCost(distanceKm, kmPerL, pricePerLiter, roundTrip);
  }, [distanceKm, kmPerL, pricePerLiter, roundTrip]);

  async function search(which: "origin" | "dest", q: string) {
    if (q.trim().length < 3) {
      toast.error("Escribe al menos 3 caracteres");
      return;
    }
    setSearching(which);
    try {
      const results = await geocode(q);
      if (which === "origin") setOResults(results);
      else setDResults(results);
      if (results.length === 0) toast.error("Sin resultados");
    } finally {
      setSearching(null);
    }
  }

  function pickResult(which: "origin" | "dest", r: GeocodeResult) {
    const point = { coord: { lat: r.lat, lng: r.lng }, label: r.label };
    if (which === "origin") {
      setOrigin(point);
      setOQuery(r.label);
      setOResults([]);
      setPickMode("dest");
    } else {
      setDest(point);
      setDQuery(r.label);
      setDResults([]);
    }
    resetRoute();
  }

  function handleMapPick(p: LatLng) {
    const label = `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`;
    if (pickMode === "origin") {
      setOrigin({ coord: p, label });
      setOQuery(label);
      setPickMode("dest");
    } else {
      setDest({ coord: p, label });
      setDQuery(label);
    }
    resetRoute();
  }

  function resetRoute() {
    setGeometry([]);
    setDistanceKm(null);
    setDurationMin(null);
  }

  async function calcRoute() {
    if (!origin || !dest) {
      toast.error("Selecciona origen y destino");
      return;
    }
    setRouting(true);
    try {
      const r = await fetchRoute(origin.coord, dest.coord);
      setGeometry(r.geometry);
      setDistanceKm(r.distanceKm);
      setDurationMin(r.durationMin);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setRouting(false);
    }
  }

  async function saveTrip() {
    if (!origin || !dest || !distanceKm) {
      toast.error("Calcula la ruta primero");
      return;
    }
    if (!name.trim()) {
      toast.error("Ponle un nombre al trayecto");
      return;
    }
    try {
      await create.mutateAsync({
        name,
        vehicleId: vehicleId || "",
        originLabel: origin.label,
        originLat: origin.coord.lat,
        originLng: origin.coord.lng,
        destLabel: dest.label,
        destLat: dest.coord.lat,
        destLng: dest.coord.lng,
        distanceKm,
        durationMin: durationMin ?? undefined,
        estimatedLiters: estimate?.liters,
        estimatedCost: estimate?.cost,
        roundTrip,
      });
      toast.success("Trayecto guardado");
      setName("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  function loadTrip(t: Trip) {
    setOrigin({
      coord: { lat: t.originLat, lng: t.originLng },
      label: t.originLabel,
    });
    setDest({ coord: { lat: t.destLat, lng: t.destLng }, label: t.destLabel });
    setOQuery(t.originLabel);
    setDQuery(t.destLabel);
    setVehicleId(t.vehicleId ?? "");
    setRoundTrip(t.roundTrip);
    setDistanceKm(t.distanceKm);
    setDurationMin(t.durationMin);
    setGeometry([]);
    toast.message("Trayecto cargado — recalcula la ruta para ver el mapa");
  }

  async function deleteTrip(t: Trip) {
    if (!confirm(`¿Eliminar "${t.name}"?`)) return;
    try {
      await remove.mutateAsync(t.id);
      toast.success("Trayecto eliminado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  const hasEfficiency = vehicleStats.avgKmPerL != null;

  return (
    <div>
      <PageHeader
        title="Trayectos"
        subtitle="Calcula y guarda el costo de tus viajes"
      />

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-5 space-y-4">
            {/* Origin */}
            <div>
              <Label htmlFor="origin">
                <MapPin className="inline size-3.5 text-accent" /> Origen
              </Label>
              <div className="flex gap-2">
                <Input
                  id="origin"
                  value={oQuery}
                  onChange={(e) => setOQuery(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), search("origin", oQuery))
                  }
                  placeholder="Buscar lugar de origen"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => search("origin", oQuery)}
                  disabled={searching === "origin"}
                >
                  {searching === "origin" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                </Button>
              </div>
              {oResults.length > 0 && (
                <ul className="mt-1 border border-border rounded-[var(--radius)] divide-y divide-border overflow-hidden">
                  {oResults.map((r, i) => (
                    <li key={i}>
                      <button
                        onClick={() => pickResult("origin", r)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      >
                        {r.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Destination */}
            <div>
              <Label htmlFor="dest">
                <Flag className="inline size-3.5 text-destructive" /> Destino
              </Label>
              <div className="flex gap-2">
                <Input
                  id="dest"
                  value={dQuery}
                  onChange={(e) => setDQuery(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), search("dest", dQuery))
                  }
                  placeholder="Buscar lugar de destino"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => search("dest", dQuery)}
                  disabled={searching === "dest"}
                >
                  {searching === "dest" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                </Button>
              </div>
              {dResults.length > 0 && (
                <ul className="mt-1 border border-border rounded-[var(--radius)] divide-y divide-border overflow-hidden">
                  {dResults.map((r, i) => (
                    <li key={i}>
                      <button
                        onClick={() => pickResult("dest", r)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      >
                        {r.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              También puedes tocar el mapa para fijar el{" "}
              <span className="font-medium text-foreground">
                {pickMode === "origin" ? "origen" : "destino"}
              </span>
              .
            </p>

            <TripMap
              origin={origin?.coord ?? null}
              dest={dest?.coord ?? null}
              geometry={geometry}
              onPick={handleMapPick}
            />

            <Button
              onClick={calcRoute}
              className="w-full"
              disabled={routing || !origin || !dest}
            >
              {routing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RouteIcon className="size-4" />
              )}
              Calcular ruta
            </Button>
          </CardContent>
        </Card>

        {/* Estimate settings */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="vehicle">Vehículo</Label>
                <Select
                  id="vehicle"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                >
                  <option value="">Todos / promedio</option>
                  {vehicles?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Precio / L</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={
                    allStats.lastPricePerLiter
                      ? String(allStats.lastPricePerLiter)
                      : "23.50"
                  }
                />
              </div>
            </div>

            {!hasEfficiency && (
              <div>
                <Label htmlFor="kmPerL">Rendimiento (km/L)</Label>
                <Input
                  id="kmPerL"
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={manualKmPerL}
                  onChange={(e) => setManualKmPerL(e.target.value)}
                  placeholder="14"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Sin datos suficientes de este vehículo — ingresa un estimado.
                </p>
              </div>
            )}

            <Checkbox
              id="roundTrip"
              label="Ida y vuelta"
              checked={roundTrip}
              onChange={(e) => setRoundTrip(e.target.checked)}
            />

            {distanceKm != null && (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-[var(--radius)] bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Distancia</p>
                  <p className="font-semibold">
                    {formatNumber(roundTrip ? distanceKm * 2 : distanceKm, 1)} km
                  </p>
                </div>
                <div className="rounded-[var(--radius)] bg-muted p-3">
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="size-3" /> Tiempo
                  </p>
                  <p className="font-semibold">
                    {durationMin != null ? `${durationMin} min` : "—"}
                  </p>
                </div>
                <div className="rounded-[var(--radius)] bg-muted p-3">
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Fuel className="size-3" /> Litros
                  </p>
                  <p className="font-semibold">
                    {estimate ? formatNumber(estimate.liters, 1) : "—"}
                  </p>
                </div>
              </div>
            )}

            {estimate && (
              <div className="rounded-[var(--radius)] bg-primary/15 p-4 text-center">
                <p className="text-sm text-muted-foreground">Costo estimado</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(estimate.cost, currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(kmPerL, 1)} km/L ·{" "}
                  {formatCurrency(pricePerLiter, currency)}/L
                </p>
              </div>
            )}

            {distanceKm != null && (
              <div className="flex gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del trayecto (Casa → Trabajo)"
                />
                <Button onClick={saveTrip} disabled={create.isPending}>
                  <Save className="size-4" /> Guardar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved trips */}
        {trips && trips.length > 0 && (
          <div>
            <h2 className="font-semibold mb-3">Trayectos guardados</h2>
            <div className="space-y-3">
              {trips.map((t) => (
                <Card key={t.id}>
                  <CardContent className="pt-5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <RouteIcon className="size-4 text-primary shrink-0" />
                        <span className="font-semibold">{t.name}</span>
                        {t.roundTrip && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            Ida y vuelta
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {t.originLabel} → {t.destLabel}
                      </p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span>
                          {formatNumber(
                            t.roundTrip ? t.distanceKm * 2 : t.distanceKm,
                            1,
                          )}{" "}
                          km
                        </span>
                        {t.estimatedCost != null && (
                          <span className="font-medium text-foreground">
                            {formatCurrency(t.estimatedCost, currency)}
                          </span>
                        )}
                        {t.vehicle?.name && <span>· {t.vehicle.name}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Cargar"
                        onClick={() => loadTrip(t)}
                      >
                        <RotateCcw className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTrip(t)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
