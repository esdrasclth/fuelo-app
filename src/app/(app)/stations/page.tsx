"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStations, useStationMutations } from "@/hooks/use-stations";
import { StationForm } from "@/components/forms/station-form";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import type { Station } from "@/lib/types";

export default function StationsPage() {
  const { data: stations, isLoading } = useStations();
  const { create, update, remove } = useStationMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(s: Station) {
    setEditing(s);
    setOpen(true);
  }

  async function handleSubmit(values: unknown) {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, body: values });
        toast.success("Gasolinera actualizada");
      } else {
        await create.mutateAsync(values);
        toast.success("Gasolinera agregada");
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  async function handleDelete(s: Station) {
    if (!confirm(`¿Eliminar "${s.brand}"?`)) return;
    try {
      await remove.mutateAsync(s.id);
      toast.success("Gasolinera eliminada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Gasolineras"
        subtitle="Estaciones y sucursales donde cargas"
        action={
          <Button onClick={openNew} size="sm">
            <Plus className="size-4" /> Agregar
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : !stations?.length ? (
        <EmptyState
          icon={<MapPin className="size-8" />}
          title="Sin gasolineras"
          description="Registra las estaciones donde cargas para comparar precios."
          action={
            <Button onClick={openNew}>
              <Plus className="size-4" /> Agregar gasolinera
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {stations.map((s) => (
            <Card key={s.id}>
              <CardContent className="pt-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary shrink-0" />
                    <p className="font-semibold truncate">{s.brand}</p>
                  </div>
                  {s.branch && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {s.branch}
                    </p>
                  )}
                  {s.address && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {s.address}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(s)}
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
        title={editing ? "Editar gasolinera" : "Nueva gasolinera"}
      >
        <StationForm
          defaultValues={editing ?? undefined}
          onSubmit={handleSubmit}
          submitting={create.isPending || update.isPending}
        />
      </Dialog>
    </div>
  );
}
