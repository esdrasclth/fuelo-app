"use client";

import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { useFuelLogs } from "@/hooks/use-fuel-logs";
import { useVehicles } from "@/hooks/use-vehicles";
import {
  computeFuelStats,
  monthlySpend,
  spendByStation,
} from "@/lib/metrics";
import {
  EfficiencyChart,
  MonthlySpendChart,
  PriceTrendChart,
  StationSpendChart,
} from "@/components/charts";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import {
  resolveUnits,
  unitsOf,
  efficiencyFromCanonical,
  efficiencyLabel,
  distanceLabel,
  volumeLabel,
  distanceFromCanonical,
  volumeFromCanonical,
  pricePerVolumeFromCanonical,
} from "@/lib/units";

export default function StatsPage() {
  const [vehicleFilter, setVehicleFilter] = useState("");
  const { data: vehicles } = useVehicles();
  const { data: logs, isLoading } = useFuelLogs(vehicleFilter || undefined);

  const units = vehicleFilter
    ? unitsOf(vehicles?.find((v) => v.id === vehicleFilter))
    : resolveUnits(vehicles);

  const stats = useMemo(() => computeFuelStats(logs ?? []), [logs]);
  const monthly = useMemo(() => monthlySpend(logs ?? []), [logs]);
  const stations = useMemo(() => spendByStation(logs ?? []), [logs]);

  const efficiency = stats.intervals.map((i) => ({
    label: formatDate(i.date),
    kmPerL: Math.round(efficiencyFromCanonical(i.kmPerL, units) * 100) / 100,
  }));
  const prices = (logs ?? [])
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((l) => ({
      label: formatDate(l.date),
      price:
        Math.round(
          pricePerVolumeFromCanonical(l.pricePerLiter, units.volumeUnit) * 100,
        ) / 100,
    }));

  return (
    <div>
      <PageHeader title="Estadísticas" subtitle="Análisis de tu consumo" />

      {!!vehicles?.length && (
        <div className="mb-4 max-w-xs">
          <Select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
          >
            <option value="">Todos los vehículos</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : !logs?.length ? (
        <EmptyState
          icon={<BarChart3 className="size-8" />}
          title="Aún no hay datos"
          description="Registra cargas para ver tus estadísticas."
        />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label="Mejor rendimiento"
              value={
                stats.bestKmPerL
                  ? `${formatNumber(efficiencyFromCanonical(stats.bestKmPerL, units), 1)} ${efficiencyLabel(units)}`
                  : "—"
              }
            />
            <KpiCard
              label="Peor rendimiento"
              value={
                stats.worstKmPerL
                  ? `${formatNumber(efficiencyFromCanonical(stats.worstKmPerL, units), 1)} ${efficiencyLabel(units)}`
                  : "—"
              }
            />
            <KpiCard
              label="Distancia medida"
              value={`${formatNumber(distanceFromCanonical(stats.totalDistance, units.distanceUnit), 0)} ${distanceLabel(units.distanceUnit)}`}
            />
            <KpiCard
              label={`${volumeLabel(units.volumeUnit) === "gal" ? "Galones" : "Litros"} totales`}
              value={`${formatNumber(volumeFromCanonical(stats.totalLiters, units.volumeUnit), 0)} ${volumeLabel(units.volumeUnit)}`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {efficiency.length > 0 && (
              <EfficiencyChart data={efficiency} unitLabel={efficiencyLabel(units)} />
            )}
            <PriceTrendChart data={prices} volumeLabel={volumeLabel(units.volumeUnit)} />
            <MonthlySpendChart data={monthly} />
            {stations.length > 0 && <StationSpendChart data={stations} />}
          </div>
        </div>
      )}
    </div>
  );
}
