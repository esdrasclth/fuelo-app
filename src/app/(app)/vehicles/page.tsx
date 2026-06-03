"use client";

import { useState } from "react";
import { Car, Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { useVehicles, useVehicleMutations } from "@/hooks/use-vehicles";
import { useSettings, useSettingsMutation } from "@/hooks/use-settings";
import { VehicleForm } from "@/components/forms/vehicle-form";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { FUEL_TYPE_LABELS, type Vehicle } from "@/lib/types";
import { distanceLabel, volumeLabel } from "@/lib/units";

export default function VehiclesPage() {
  const { data: vehicles, isLoading } = useVehicles();
  const { create, update, remove } = useVehicleMutations();
  const { data: settings } = useSettings();
  const setFavorite = useSettingsMutation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);

  async function toggleFavorite(v: Vehicle) {
    const next = settings?.defaultVehicleId === v.id ? null : v.id;
    try {
      await setFavorite.mutateAsync({ defaultVehicleId: next });
      toast.success(next ? `"${v.name}" es tu favorito` : "Favorito quitado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(v: Vehicle) {
    setEditing(v);
    setOpen(true);
  }

  async function handleSubmit(values: unknown) {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, body: values });
        toast.success("Vehículo actualizado");
      } else {
        await create.mutateAsync(values);
        toast.success("Vehículo agregado");
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  async function handleDelete(v: Vehicle) {
    if (!confirm(`¿Eliminar "${v.name}"? Se borrarán sus cargas.`)) return;
    try {
      await remove.mutateAsync(v.id);
      toast.success("Vehículo eliminado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Vehículos"
        subtitle="Administra los autos de tu familia"
        action={
          <Button onClick={openNew} size="sm">
            <Plus className="size-4" /> Agregar
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : !vehicles?.length ? (
        <EmptyState
          icon={<Car className="size-8" />}
          title="Sin vehículos"
          description="Agrega tu primer vehículo para empezar a registrar cargas."
          action={
            <Button onClick={openNew}>
              <Plus className="size-4" /> Agregar vehículo
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {vehicles.map((v) => (
            <Card key={v.id}>
              <CardContent className="pt-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Car className="size-4 text-primary shrink-0" />
                    <p className="font-semibold truncate">{v.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {[v.make, v.model, v.year].filter(Boolean).join(" ") || "—"}
                  </p>
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-muted">
                      {FUEL_TYPE_LABELS[v.fuelType]}
                    </span>
                    {v.plate && (
                      <span className="px-2 py-0.5 rounded-full bg-muted">
                        {v.plate}
                      </span>
                    )}
                    {v.tankCapacity && (
                      <span className="px-2 py-0.5 rounded-full bg-muted">
                        {v.tankCapacity} L
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-muted">
                      {distanceLabel(v.distanceUnit)}/{volumeLabel(v.volumeUnit)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(v)}
                    disabled={setFavorite.isPending}
                    aria-label={
                      settings?.defaultVehicleId === v.id
                        ? "Quitar de favoritos"
                        : "Marcar como favorito"
                    }
                  >
                    <Star
                      className={
                        settings?.defaultVehicleId === v.id
                          ? "size-4 text-primary"
                          : "size-4 text-muted-foreground"
                      }
                      fill={
                        settings?.defaultVehicleId === v.id
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(v)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar vehículo" : "Nuevo vehículo"}
      >
        <VehicleForm
          defaultValues={editing ?? undefined}
          onSubmit={handleSubmit}
          submitting={create.isPending || update.isPending}
        />
      </Dialog>
    </div>
  );
}
