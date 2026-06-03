"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Download,
  LogOut,
  User,
  FileSpreadsheet,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useSettings, useSettingsMutation } from "@/hooks/use-settings";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currencies";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: settings } = useSettings();
  const save = useSettingsMutation();

  // El estado local solo guarda la edición pendiente para no pisar lo que
  // llega del servidor mientras carga.
  const [currencyEdit, setCurrencyEdit] = useState<string | null>(null);
  const currency = currencyEdit ?? settings?.currency ?? DEFAULT_CURRENCY;

  async function handleSave() {
    try {
      await save.mutateAsync({ currency });
      toast.success("Preferencias guardadas");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div>
      <PageHeader title="Ajustes" subtitle="Tu cuenta y tus datos" />

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                <User className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {session?.user?.name ?? "Conductor"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="size-4 text-primary" />
              <h2 className="font-semibold">Preferencias</h2>
            </div>

            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Select
                id="currency"
                value={currency}
                onChange={(e) => setCurrencyEdit(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Se usa en todos tus montos y precios.
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={save.isPending}
              className="w-full"
            >
              {save.isPending ? "Guardando…" : "Guardar preferencias"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-primary" />
              <h2 className="font-semibold">Exportar datos</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Descarga todas tus cargas de combustible en formato CSV (compatible
              con Excel y Google Sheets).
            </p>
            <a
              href="/api/export"
              download
              className={buttonVariants({ variant: "secondary" })}
            >
              <Download className="size-4" /> Descargar CSV
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="size-4" /> Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
