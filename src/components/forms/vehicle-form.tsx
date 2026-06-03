"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { vehicleSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  FUEL_TYPE_LABELS,
  DISTANCE_UNIT_LABELS,
  VOLUME_UNIT_LABELS,
  type Vehicle,
} from "@/lib/types";
import { useHouseholds } from "@/hooks/use-households";

type Values = z.input<typeof vehicleSchema>;

export function VehicleForm({
  defaultValues,
  onSubmit,
  submitting,
}: {
  defaultValues?: Partial<Vehicle>;
  onSubmit: (values: Values) => void;
  submitting?: boolean;
}) {
  const { data: households } = useHouseholds();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      make: defaultValues?.make ?? "",
      model: defaultValues?.model ?? "",
      year: defaultValues?.year ?? undefined,
      plate: defaultValues?.plate ?? "",
      fuelType: defaultValues?.fuelType ?? "MAGNA",
      tankCapacity: defaultValues?.tankCapacity ?? undefined,
      distanceUnit: defaultValues?.distanceUnit ?? "KM",
      volumeUnit: defaultValues?.volumeUnit ?? "L",
      householdId: defaultValues?.householdId ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" placeholder="Mi Auto" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="make">Marca</Label>
          <Input id="make" placeholder="Nissan" {...register("make")} />
        </div>
        <div>
          <Label htmlFor="model">Modelo</Label>
          <Input id="model" placeholder="Versa" {...register("model")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="year">Año</Label>
          <Input id="year" type="number" placeholder="2020" {...register("year")} />
        </div>
        <div>
          <Label htmlFor="plate">Placa</Label>
          <Input id="plate" placeholder="ABC-123" {...register("plate")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="fuelType">Combustible</Label>
          <Select id="fuelType" {...register("fuelType")}>
            {Object.entries(FUEL_TYPE_LABELS).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="tankCapacity">
            {watch("volumeUnit") === "KWH" ? "Batería (kWh)" : "Tanque (L)"}
          </Label>
          <Input
            id="tankCapacity"
            type="number"
            step="0.1"
            placeholder={watch("volumeUnit") === "KWH" ? "60" : "41"}
            {...register("tankCapacity")}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="distanceUnit">Unidad de distancia</Label>
          <Select id="distanceUnit" {...register("distanceUnit")}>
            {Object.entries(DISTANCE_UNIT_LABELS).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="volumeUnit">Unidad de volumen</Label>
          <Select id="volumeUnit" {...register("volumeUnit")}>
            {Object.entries(VOLUME_UNIT_LABELS).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        Cómo capturas y ves los datos de este vehículo. Internamente todo se
        guarda igual, así que puedes cambiarlo cuando quieras.
      </p>
      {!!households?.length && (
        <div>
          <Label htmlFor="householdId">Compartir con hogar</Label>
          <Select id="householdId" {...register("householdId")}>
            <option value="">Solo yo</option>
            {households.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Los miembros del hogar verán este vehículo y podrán registrar
            cargas.
          </p>
        </div>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? "Guardando…" : "Guardar vehículo"}
      </Button>
    </form>
  );
}
