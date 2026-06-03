"use client";

import { useState } from "react";
import { Fuel, Plus, Pencil, Trash2, Gauge } from "lucide-react";
import { toast } from "sonner";
import { useFuelLogs, useFuelLogMutations } from "@/hooks/use-fuel-logs";
import { useVehicles } from "@/hooks/use-vehicles";
import { useCurrency } from "@/hooks/use-settings";
import { FuelForm } from "@/components/forms/fuel-form";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { FUEL_TYPE_LABELS, type FuelLog } from "@/lib/types";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import {
  unitsOf,
  distanceLabel,
  volumeLabel,
  distanceFromCanonical,
  volumeFromCanonical,
  pricePerVolumeFromCanonical,
} from "@/lib/units";

export default function FuelPage() {
  const [vehicleFilter, setVehicleFilter] = useState("");
  const { data: vehicles } = useVehicles();
  const currency = useCurrency();
  const { data: logs, isLoading } = useFuelLogs(vehicleFilter || undefined);
  const { create, update, remove } = useFuelLogMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FuelLog | null>(null);

  const hasVehicles = !!vehicles?.length;
  const unitsForVehicle = (id: string) =>
    unitsOf(vehicles?.find((v) => v.id === id));

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(l: FuelLog) {
    setEditing(l);
    setOpen(true);
  }

  async function handleSubmit(values: unknown) {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, body: values });
        toast.success("Carga actualizada");
      } else {
        const res = await create.mutateAsync(values as Record<string, unknown>);
        toast.success(
          res.offline
            ? "Guardada sin conexión, se sincronizará"
            : "Carga registrada",
        );
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  async function handleDelete(l: FuelLog) {
    if (!confirm("¿Eliminar esta carga?")) return;
    try {
      await remove.mutateAsync(l.id);
      toast.success("Carga eliminada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Cargas"
        subtitle="Historial de combustible"
        action={
          <Button onClick={openNew} size="sm" disabled={!hasVehicles}>
            <Plus className="size-4" /> Nueva
          </Button>
        }
      />

      {hasVehicles && (
        <div className="mb-4 max-w-xs">
          <Select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
          >
            <option value="">Todos los vehículos</option>
            {vehicles?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {!hasVehicles ? (
        <EmptyState
          icon={<Fuel className="size-8" />}
          title="Primero agrega un vehículo"
          description="Necesitas al menos un vehículo para registrar cargas."
        />
      ) : isLoading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : !logs?.length ? (
        <EmptyState
          icon={<Fuel className="size-8" />}
          title="Sin cargas registradas"
          description="Registra tu primera carga de combustible."
          action={
            <Button onClick={openNew}>
              <Plus className="size-4" /> Nueva carga
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {logs.map((l) => {
            const u = unitsForVehicle(l.vehicleId);
            return (
            <Card key={l.id}>
              <CardContent className="pt-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Fuel className="size-4 text-primary shrink-0" />
                    <span className="font-semibold">
                      {formatCurrency(l.totalCost, currency)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      · {formatNumber(volumeFromCanonical(l.liters, u.volumeUnit))}{" "}
                      {volumeLabel(u.volumeUnit)} ·{" "}
                      {formatCurrency(
                        pricePerVolumeFromCanonical(l.pricePerLiter, u.volumeUnit),
                        currency,
                      )}
                      /{volumeLabel(u.volumeUnit)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(l.date)} · {FUEL_TYPE_LABELS[l.fuelType]}
                    {l.vehicle?.name ? ` · ${l.vehicle.name}` : ""}
                  </p>
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground flex-wrap items-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted">
                      <Gauge className="size-3" />
                      {formatNumber(distanceFromCanonical(l.odometer, u.distanceUnit), 0)}{" "}
                      {distanceLabel(u.distanceUnit)}
                    </span>
                    {l.station && (
                      <span className="px-2 py-0.5 rounded-full bg-muted">
                        {l.station.brand}
                      </span>
                    )}
                    {l.isFullTank ? (
                      <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                        Tanque lleno
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-muted">
                        Parcial
                      </span>
                    )}
                  </div>
                  {l.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {l.notes}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(l)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(l)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar carga" : "Nueva carga"}
      >
        <FuelForm
          defaultValues={editing ?? undefined}
          onSubmit={handleSubmit}
          submitting={create.isPending || update.isPending}
        />
      </Dialog>
    </div>
  );
}
