"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { stationSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Station } from "@/lib/types";

type Values = z.input<typeof stationSchema>;

export function StationForm({
  defaultValues,
  onSubmit,
  submitting,
}: {
  defaultValues?: Partial<Station>;
  onSubmit: (values: Values) => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(stationSchema),
    defaultValues: {
      brand: defaultValues?.brand ?? "",
      branch: defaultValues?.branch ?? "",
      address: defaultValues?.address ?? "",
      latitude: defaultValues?.latitude ?? undefined,
      longitude: defaultValues?.longitude ?? undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="brand">Marca *</Label>
        <Input id="brand" placeholder="Pemex, BP, Shell…" {...register("brand")} />
        {errors.brand && (
          <p className="text-xs text-destructive mt-1">{errors.brand.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="branch">Sucursal</Label>
        <Input id="branch" placeholder="Av. Universidad" {...register("branch")} />
      </div>
      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" placeholder="Calle, colonia, ciudad" {...register("address")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="latitude">Latitud</Label>
          <Input id="latitude" type="number" step="any" {...register("latitude")} />
        </div>
        <div>
          <Label htmlFor="longitude">Longitud</Label>
          <Input id="longitude" type="number" step="any" {...register("longitude")} />
        </div>
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? "Guardando…" : "Guardar gasolinera"}
      </Button>
    </form>
  );
}
