"use client";

import { useState } from "react";
import { Users, Plus, Trash2, LogOut, Mail, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  useHouseholds,
  useInvites,
  useHouseholdMutations,
} from "@/hooks/use-households";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Household } from "@/lib/types";

export default function HouseholdPage() {
  const { data: households, isLoading } = useHouseholds();
  const { data: invites } = useInvites();
  const { create, remove, invite, accept, decline } = useHouseholdMutations();
  const [name, setName] = useState("");
  const [inviteEmail, setInviteEmail] = useState<Record<string, string>>({});

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      await create.mutateAsync(name.trim());
      setName("");
      toast.success("Hogar creado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  async function handleInvite(h: Household) {
    const email = (inviteEmail[h.id] ?? "").trim();
    if (!email) return;
    try {
      await invite.mutateAsync({ id: h.id, email });
      setInviteEmail((m) => ({ ...m, [h.id]: "" }));
      toast.success(`Invitación enviada a ${email}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  async function handleLeave(h: Household) {
    const msg = h.isOwner
      ? `¿Eliminar el hogar "${h.name}"? Los vehículos compartidos dejarán de estarlo.`
      : `¿Salir del hogar "${h.name}"?`;
    if (!confirm(msg)) return;
    try {
      await remove.mutateAsync(h.id);
      toast.success(h.isOwner ? "Hogar eliminado" : "Saliste del hogar");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Hogar"
        subtitle="Comparte vehículos y cargas con tu familia"
      />

      <div className="space-y-4">
        {!!invites?.length && (
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Mail className="size-4" />
                <h2 className="font-semibold">Invitaciones pendientes</h2>
              </div>
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{inv.householdName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Te invitó {inv.invitedByName ?? inv.invitedByEmail}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Aceptar"
                      onClick={async () => {
                        try {
                          await accept.mutateAsync(inv.id);
                          toast.success(`Te uniste a "${inv.householdName}"`);
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Error");
                        }
                      }}
                    >
                      <Check className="size-4 text-primary" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Rechazar"
                      onClick={async () => {
                        try {
                          await decline.mutateAsync(inv.id);
                          toast.success("Invitación rechazada");
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Error");
                        }
                      }}
                    >
                      <X className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <Plus className="size-4 text-primary" />
              <h2 className="font-semibold">Crear un hogar</h2>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Familia García"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button onClick={handleCreate} disabled={create.isPending}>
                Crear
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : !households?.length ? (
          <EmptyState
            icon={<Users className="size-8" />}
            title="Sin hogares todavía"
            description="Crea un hogar para compartir vehículos y cargas con tu familia."
          />
        ) : (
          households.map((h) => (
            <Card key={h.id}>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-primary shrink-0" />
                      <p className="font-semibold truncate">{h.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {h.members.length} miembro
                      {h.members.length === 1 ? "" : "s"} · {h.vehicleCount}{" "}
                      vehículo{h.vehicleCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleLeave(h)}
                    aria-label={h.isOwner ? "Eliminar hogar" : "Salir del hogar"}
                  >
                    {h.isOwner ? (
                      <Trash2 className="size-4 text-destructive" />
                    ) : (
                      <LogOut className="size-4 text-destructive" />
                    )}
                  </Button>
                </div>

                <ul className="space-y-1 text-sm">
                  {h.members.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="truncate">{m.name ?? m.email}</span>
                      <span className="text-xs text-muted-foreground">
                        {m.role === "OWNER" ? "Dueño" : "Miembro"}
                      </span>
                    </li>
                  ))}
                </ul>

                {h.isOwner && (
                  <div className="flex gap-2 pt-1">
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={inviteEmail[h.id] ?? ""}
                      onChange={(e) =>
                        setInviteEmail((m) => ({
                          ...m,
                          [h.id]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      variant="secondary"
                      onClick={() => handleInvite(h)}
                      disabled={invite.isPending}
                    >
                      <Mail className="size-4" /> Invitar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
