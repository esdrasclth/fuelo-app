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
import { useVehicles } from "@/hooks/use-vehicles";
import { useStations } from "@/hooks/use-stations";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currencies";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: settings } = useSettings();
  const { data: vehicles } = useVehicles();
  const { data: stations } = useStations();
  const save = useSettingsMutation();

  // Los valores guardados son la base; el estado local solo guarda ediciones
  // pendientes para no pisar lo que llega del servidor mientras carga.
  const [currencyEdit, setCurrencyEdit] = useState<string | null>(null);
  const [vehicleEdit, setVehicleEdit] = useState<string | null>(null);
  const [stationEdit, setStationEdit] = useState<string | null>(null);

  const currency = currencyEdit ?? settings?.currency ?? DEFAULT_CURRENCY;
  const defaultVehicleId = vehicleEdit ?? settings?.defaultVehicleId ?? "";
  const defaultStationId = stationEdit ?? settings?.defaultStationId ?? "";

  async function handleSave() {
    try {
      await save.mutateAsync({
        currency,
        defaultVehicleId: defaultVehicleId || null,
        defaultStationId: defaultStationId || null,
      });
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

            <div>
              <Label htmlFor="defaultVehicleId">Vehículo favorito</Label>
              <Select
                id="defaultVehicleId"
                value={defaultVehicleId}
                onChange={(e) => setVehicleEdit(e.target.value)}
              >
                <option value="">Sin favorito</option>
                {vehicles?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="defaultStationId">Gasolinera favorita</Label>
              <Select
                id="defaultStationId"
                value={defaultStationId}
                onChange={(e) => setStationEdit(e.target.value)}
              >
                <option value="">Sin favorita</option>
                {stations?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.brand}
                    {s.branch ? ` — ${s.branch}` : ""}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Aparecerán seleccionadas por defecto al registrar una carga.
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
