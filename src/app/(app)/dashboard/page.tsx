"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus, Gauge, DollarSign, Wallet, Fuel, Car } from "lucide-react";
import { toast } from "sonner";
import { useFuelLogs, useFuelLogMutations } from "@/hooks/use-fuel-logs";
import { useVehicles } from "@/hooks/use-vehicles";
import { useCurrency } from "@/hooks/use-settings";
import { computeFuelStats, monthlySpend } from "@/lib/metrics";
import { KpiCard } from "@/components/kpi-card";
import { EfficiencyChart, MonthlySpendChart } from "@/components/charts";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { FuelForm } from "@/components/forms/fuel-form";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { FUEL_TYPE_LABELS } from "@/lib/types";
import {
  resolveUnits,
  unitsOf,
  efficiencyFromCanonical,
  efficiencyLabel,
  distanceLabel,
  volumeLabel,
  distanceFromCanonical,
  volumeFromCanonical,
  costPerDistanceFromCanonical,
  pricePerVolumeFromCanonical,
} from "@/lib/units";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: vehicles } = useVehicles();
  const currency = useCurrency();
  const { data: logs, isLoading } = useFuelLogs();
  const { create } = useFuelLogMutations();
  const [open, setOpen] = useState(false);

  const units = resolveUnits(vehicles);
  const unitsForVehicle = (id: string) =>
    unitsOf(vehicles?.find((v) => v.id === id));
  const stats = useMemo(() => computeFuelStats(logs ?? []), [logs]);
  const monthly = useMemo(() => monthlySpend(logs ?? []), [logs]);
  const efficiency = stats.intervals.map((i) => ({
    label: formatDate(i.date),
    kmPerL: Math.round(efficiencyFromCanonical(i.kmPerL, units) * 100) / 100,
  }));

  async function handleSubmit(values: unknown) {
    try {
      const res = await create.mutateAsync(values as Record<string, unknown>);
      toast.success(
        res.offline
          ? "Guardada sin conexión, se sincronizará"
          : "Carga registrada",
      );
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "conductor";
  const hasVehicles = !!vehicles?.length;
  const recent = (logs ?? []).slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`Hola, ${firstName} 👋`}
        subtitle="Tu resumen de combustible"
        action={
          <Button onClick={() => setOpen(true)} size="sm" disabled={!hasVehicles}>
            <Plus className="size-4" /> Carga
          </Button>
        }
      />

      {!hasVehicles ? (
        <EmptyState
          icon={<Car className="size-8" />}
          title="Empieza agregando un vehículo"
          description="Registra tu auto para comenzar a medir tu consumo."
          action={
            <Link href="/vehicles" className={buttonVariants()}>
              Agregar vehículo
            </Link>
          }
        />
      ) : isLoading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label="Rendimiento"
              value={
                stats.avgKmPerL
                  ? `${formatNumber(efficiencyFromCanonical(stats.avgKmPerL, units), 1)} ${efficiencyLabel(units)}`
                  : "—"
              }
              hint="Promedio (tanque lleno)"
              icon={<Gauge className="size-4" />}
            />
            <KpiCard
              label={`Costo por ${distanceLabel(units.distanceUnit)}`}
              value={
                stats.avgCostPerKm
                  ? formatCurrency(
                      costPerDistanceFromCanonical(
                        stats.avgCostPerKm,
                        units.distanceUnit,
                      ),
                      currency,
                    )
                  : "—"
              }
              hint="Promedio"
              icon={<DollarSign className="size-4" />}
            />
            <KpiCard
              label="Gasto total"
              value={formatCurrency(stats.totalSpent, currency)}
              hint={`${stats.fills} cargas`}
              icon={<Wallet className="size-4" />}
            />
            <KpiCard
              label="Precio actual"
              value={
                stats.lastPricePerLiter
                  ? `${formatCurrency(pricePerVolumeFromCanonical(stats.lastPricePerLiter, units.volumeUnit), currency)}/${volumeLabel(units.volumeUnit)}`
                  : "—"
              }
              hint="Última carga"
              icon={<Fuel className="size-4" />}
            />
          </div>

          {stats.intervals.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <EfficiencyChart data={efficiency} unitLabel={efficiencyLabel(units)} />
              <MonthlySpendChart data={monthly} />
            </div>
          ) : (
            <EmptyState
              icon={<Fuel className="size-8" />}
              title="Registra al menos 2 cargas con tanque lleno"
              description="Necesitamos dos llenados completos para calcular tu rendimiento."
              action={
                <Button onClick={() => setOpen(true)}>
                  <Plus className="size-4" /> Nueva carga
                </Button>
              }
            />
          )}

          {recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Cargas recientes</h2>
                <Link href="/fuel" className="text-sm text-primary">
                  Ver todas
                </Link>
              </div>
              <div className="space-y-2">
                {recent.map((l) => {
                  const u = unitsForVehicle(l.vehicleId);
                  return (
                  <Card key={l.id}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {formatCurrency(l.totalCost, currency)}{" "}
                          <span className="text-sm text-muted-foreground font-normal">
                            · {formatNumber(volumeFromCanonical(l.liters, u.volumeUnit))}{" "}
                            {volumeLabel(u.volumeUnit)}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(l.date)} · {FUEL_TYPE_LABELS[l.fuelType]}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatNumber(distanceFromCanonical(l.odometer, u.distanceUnit), 0)}{" "}
                        {distanceLabel(u.distanceUnit)}
                      </span>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Nueva carga">
        <FuelForm onSubmit={handleSubmit} submitting={create.isPending} />
      </Dialog>
    </div>
  );
}
