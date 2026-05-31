"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fuelLogSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useVehicles } from "@/hooks/use-vehicles";
import { useStations } from "@/hooks/use-stations";
import { FUEL_TYPE_LABELS, type FuelLog } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  DEFAULT_UNITS,
  unitsOf,
  distanceLabel,
  volumeLabel,
  distanceFromCanonical,
  distanceToCanonical,
  volumeFromCanonical,
  volumeToCanonical,
  pricePerVolumeFromCanonical,
  pricePerVolumeToCanonical,
} from "@/lib/units";

type Values = z.input<typeof fuelLogSchema>;

function toLocalInput(date: Date) {
  const off = date.getTimezoneOffset();
  return new Date(date.getTime() - off * 60000).toISOString().slice(0, 16);
}

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

export function FuelForm({
  defaultValues,
  onSubmit,
  submitting,
}: {
  defaultValues?: Partial<FuelLog>;
  onSubmit: (values: Values) => void;
  submitting?: boolean;
}) {
  const { data: vehicles } = useVehicles();
  const { data: stations } = useStations();
  const [locating, setLocating] = useState(false);

  const unitsForVehicle = (id?: string) =>
    unitsOf(vehicles?.find((v) => v.id === id)) ?? DEFAULT_UNITS;

  // Existing logs are stored in canonical km/L; show them in the vehicle's units.
  const editUnits = unitsForVehicle(defaultValues?.vehicleId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(fuelLogSchema),
    defaultValues: {
      vehicleId: defaultValues?.vehicleId ?? "",
      date: defaultValues?.date
        ? toLocalInput(new Date(defaultValues.date))
        : toLocalInput(new Date()),
      odometer:
        defaultValues?.odometer != null
          ? round(distanceFromCanonical(defaultValues.odometer, editUnits.distanceUnit), 1)
          : undefined,
      liters:
        defaultValues?.liters != null
          ? round(volumeFromCanonical(defaultValues.liters, editUnits.volumeUnit))
          : undefined,
      pricePerLiter:
        defaultValues?.pricePerLiter != null
          ? round(pricePerVolumeFromCanonical(defaultValues.pricePerLiter, editUnits.volumeUnit))
          : undefined,
      totalCost: defaultValues?.totalCost ?? undefined,
      fuelType: defaultValues?.fuelType ?? "MAGNA",
      stationId: defaultValues?.stationId ?? "",
      isFullTank: defaultValues?.isFullTank ?? true,
      missedPrevious: defaultValues?.missedPrevious ?? false,
      latitude: defaultValues?.latitude ?? undefined,
      longitude: defaultValues?.longitude ?? undefined,
      notes: defaultValues?.notes ?? "",
    },
  });

  const liters = Number(watch("liters")) || 0;
  const totalCost = Number(watch("totalCost")) || 0;
  const computedPrice =
    liters > 0 ? Math.round((totalCost / liters) * 100) / 100 : 0;
  const lat = watch("latitude");
  const lng = watch("longitude");
  const units = unitsForVehicle(watch("vehicleId"));
  const volWord = units.volumeUnit === "GAL" ? "Galones" : "Litros";

  // El precio por unidad se deriva de total ÷ volumen y se guarda en un
  // campo oculto para satisfacer el esquema (pricePerLiter es requerido).
  useEffect(() => {
    setValue("pricePerLiter", computedPrice, { shouldValidate: false });
  }, [computedPrice, setValue]);

  // Inputs are captured in the vehicle's units; persist everything in canonical km/L.
  function submit(values: Values) {
    const u = unitsForVehicle(values.vehicleId);
    onSubmit({
      ...values,
      odometer: distanceToCanonical(Number(values.odometer), u.distanceUnit),
      liters: volumeToCanonical(Number(values.liters), u.volumeUnit),
      pricePerLiter: pricePerVolumeToCanonical(
        Number(values.pricePerLiter),
        u.volumeUnit,
      ),
    });
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      toast.error("Tu dispositivo no soporta GPS");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", pos.coords.latitude);
        setValue("longitude", pos.coords.longitude);
        setLocating(false);
        toast.success("Ubicación capturada");
      },
      () => {
        setLocating(false);
        toast.error("No se pudo obtener la ubicación");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <Label htmlFor="vehicleId">Vehículo *</Label>
        <Select id="vehicleId" {...register("vehicleId")}>
          <option value="">Selecciona…</option>
          {vehicles?.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </Select>
        {errors.vehicleId && (
          <p className="text-xs text-destructive mt-1">
            {errors.vehicleId.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="date">Fecha y hora *</Label>
        <Input id="date" type="datetime-local" {...register("date")} />
      </div>

      <div>
        <Label htmlFor="odometer">
          Odómetro al cargar ({distanceLabel(units.distanceUnit)}) *
        </Label>
        <Input
          id="odometer"
          type="number"
          step="0.1"
          inputMode="decimal"
          placeholder="31720"
          {...register("odometer")}
        />
        {errors.odometer && (
          <p className="text-xs text-destructive mt-1">
            {errors.odometer.message}
          </p>
        )}
      </div>

      <input type="hidden" {...register("pricePerLiter")} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="liters">{volWord} *</Label>
          <Input
            id="liters"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="33.5"
            {...register("liters")}
          />
          {errors.liters && (
            <p className="text-xs text-destructive mt-1">
              {errors.liters.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="totalCost">Total pagado *</Label>
          <Input
            id="totalCost"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="790.00"
            {...register("totalCost")}
          />
          {errors.totalCost && (
            <p className="text-xs text-destructive mt-1">
              {errors.totalCost.message}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-muted px-3.5 py-3">
        <p className="text-xs font-medium text-muted-foreground">
          Precio por {volumeLabel(units.volumeUnit)} (calculado)
        </p>
        <p className="text-lg font-bold tracking-tight">
          {computedPrice > 0 ? (
            `${formatCurrency(computedPrice)}/${volumeLabel(units.volumeUnit)}`
          ) : (
            <span className="text-muted-foreground font-normal text-sm">
              Ingresa litros y total para calcularlo
            </span>
          )}
        </p>
        {errors.pricePerLiter && computedPrice <= 0 && (
          <p className="text-xs text-destructive mt-1">
            Ingresa litros y total válidos.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="fuelType">Tipo</Label>
          <Select id="fuelType" {...register("fuelType")}>
            {Object.entries(FUEL_TYPE_LABELS).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="stationId">Gasolinera</Label>
          <Select id="stationId" {...register("stationId")}>
            <option value="">Sin especificar</option>
            {stations?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.brand}
                {s.branch ? ` — ${s.branch}` : ""}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2.5 rounded-[var(--radius)] border border-border p-3">
        <Checkbox
          id="isFullTank"
          label="Tanque lleno (necesario para calcular rendimiento)"
          {...register("isFullTank")}
        />
        <Checkbox
          id="missedPrevious"
          label="Olvidé registrar la carga anterior"
          {...register("missedPrevious")}
        />
      </div>

      <div>
        <Label>Ubicación (GPS)</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={captureLocation}
            disabled={locating}
          >
            {locating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MapPin className="size-4" />
            )}
            Capturar
          </Button>
          {lat && lng ? (
            <span className="text-xs text-muted-foreground">
              {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Opcional — guarda dónde cargaste
            </span>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Input id="notes" placeholder="Opcional" {...register("notes")} />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? "Guardando…" : "Guardar carga"}
      </Button>
    </form>
  );
}
