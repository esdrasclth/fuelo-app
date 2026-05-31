"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  BellRing,
  Plus,
  Pencil,
  Trash2,
  Check,
  RotateCcw,
  Gauge,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useReminders, useReminderMutations } from "@/hooks/use-reminders";
import { ReminderForm } from "@/components/forms/reminder-form";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { REMINDER_TYPE_LABELS, type Reminder } from "@/lib/types";
import { formatDate, formatNumber, cn } from "@/lib/utils";

function dueStatus(r: Reminder): { label: string; tone: string } | null {
  if (r.completed) return null;
  if (!r.dueDate) return null;
  const days = Math.ceil(
    (new Date(r.dueDate).getTime() - Date.now()) / 86400000,
  );
  if (days < 0)
    return { label: `Vencido hace ${-days} d`, tone: "text-destructive" };
  if (days === 0) return { label: "Vence hoy", tone: "text-destructive" };
  if (days <= 7) return { label: `En ${days} d`, tone: "text-accent" };
  return { label: `En ${days} d`, tone: "text-muted-foreground" };
}

export default function RemindersPage() {
  const { data: reminders, isLoading } = useReminders();
  const { create, update, remove } = useReminderMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [notifReady, setNotifReady] = useState(false);

  useEffect(() => {
    if (typeof Notification !== "undefined")
      setNotifReady(Notification.permission === "granted");
  }, []);

  useEffect(() => {
    if (!notifReady || !reminders) return;
    const overdue = reminders.filter((r) => {
      const s = dueStatus(r);
      return s && s.tone === "text-destructive";
    });
    for (const r of overdue) {
      new Notification("Recordatorio Fuelo", {
        body: `${r.title} · ${dueStatus(r)?.label}`,
        icon: "/icons/icon-192.png",
      });
    }
  }, [notifReady, reminders]);

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      toast.error("Tu navegador no soporta notificaciones");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotifReady(true);
      toast.success("Notificaciones activadas");
    } else {
      toast.error("Permiso denegado");
    }
  }

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(r: Reminder) {
    setEditing(r);
    setOpen(true);
  }

  async function handleSubmit(values: unknown) {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, body: values });
        toast.success("Recordatorio actualizado");
      } else {
        await create.mutateAsync(values);
        toast.success("Recordatorio creado");
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  async function toggleComplete(r: Reminder) {
    try {
      await update.mutateAsync({
        id: r.id,
        body: { completed: !r.completed },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  async function handleDelete(r: Reminder) {
    if (!confirm(`¿Eliminar "${r.title}"?`)) return;
    try {
      await remove.mutateAsync(r.id);
      toast.success("Recordatorio eliminado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Recordatorios"
        subtitle="Servicios, verificaciones y pagos"
        action={
          <Button onClick={openNew} size="sm">
            <Plus className="size-4" /> Nuevo
          </Button>
        }
      />

      {!notifReady && (
        <button
          onClick={enableNotifications}
          className="mb-4 flex w-full items-center gap-2 rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <BellRing className="size-4 text-primary" />
          Activar notificaciones del navegador
        </button>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : !reminders?.length ? (
        <EmptyState
          icon={<Bell className="size-8" />}
          title="Sin recordatorios"
          description="Crea recordatorios para no olvidar servicios o verificaciones."
          action={
            <Button onClick={openNew}>
              <Plus className="size-4" /> Nuevo recordatorio
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => {
            const status = dueStatus(r);
            return (
              <Card key={r.id} className={cn(r.completed && "opacity-60")}>
                <CardContent className="pt-5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "font-semibold",
                          r.completed && "line-through",
                        )}
                      >
                        {r.title}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {REMINDER_TYPE_LABELS[r.type]}
                      </span>
                      {status && (
                        <span className={cn("text-xs font-medium", status.tone)}>
                          {status.label}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                      {r.dueDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatDate(r.dueDate)}
                        </span>
                      )}
                      {r.dueOdometer != null && (
                        <span className="inline-flex items-center gap-1">
                          <Gauge className="size-3" />
                          {formatNumber(r.dueOdometer, 0)} km
                        </span>
                      )}
                      {r.recurring && r.intervalDays && (
                        <span className="inline-flex items-center gap-1">
                          <RotateCcw className="size-3" />
                          cada {r.intervalDays} d
                        </span>
                      )}
                      {r.vehicle?.name && <span>· {r.vehicle.name}</span>}
                    </div>
                    {r.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        {r.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={r.completed ? "Reabrir" : "Completar"}
                      onClick={() => toggleComplete(r)}
                    >
                      {r.completed ? (
                        <RotateCcw className="size-4" />
                      ) : (
                        <Check className="size-4 text-accent" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(r)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(r)}
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
        title={editing ? "Editar recordatorio" : "Nuevo recordatorio"}
      >
        <ReminderForm
          defaultValues={editing ?? undefined}
          onSubmit={handleSubmit}
          submitting={create.isPending || update.isPending}
        />
      </Dialog>
    </div>
  );
}
