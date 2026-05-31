"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { reminderSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useVehicles } from "@/hooks/use-vehicles";
import { REMINDER_TYPE_LABELS, type Reminder } from "@/lib/types";

type Values = z.input<typeof reminderSchema>;

export function ReminderForm({
  defaultValues,
  onSubmit,
  submitting,
}: {
  defaultValues?: Partial<Reminder>;
  onSubmit: (values: Values) => void;
  submitting?: boolean;
}) {
  const { data: vehicles } = useVehicles();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      type: defaultValues?.type ?? "SERVICE",
      title: defaultValues?.title ?? "",
      vehicleId: defaultValues?.vehicleId ?? "",
      dueDate: defaultValues?.dueDate
        ? new Date(defaultValues.dueDate).toISOString().slice(0, 10)
        : "",
      dueOdometer: defaultValues?.dueOdometer ?? undefined,
      recurring: defaultValues?.recurring ?? false,
      intervalDays: defaultValues?.intervalDays ?? undefined,
      notes: defaultValues?.notes ?? "",
    },
  });

  const recurring = watch("recurring");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          placeholder="Cambio de aceite"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select id="type" {...register("type")}>
            {Object.entries(REMINDER_TYPE_LABELS).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="vehicleId">Vehículo</Label>
          <Select id="vehicleId" {...register("vehicleId")}>
            <option value="">Todos</option>
            {vehicles?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="dueDate">Fecha límite</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
        </div>
        <div>
          <Label htmlFor="dueOdometer">KM límite</Label>
          <Input
            id="dueOdometer"
            type="number"
            step="1"
            inputMode="numeric"
            placeholder="40000"
            {...register("dueOdometer")}
          />
        </div>
      </div>

      <div className="space-y-2.5 rounded-[var(--radius)] border border-border p-3">
        <Checkbox
          id="recurring"
          label="Recurrente (se repite cada cierto tiempo)"
          {...register("recurring")}
        />
        {recurring && (
          <div>
            <Label htmlFor="intervalDays">Cada cuántos días</Label>
            <Input
              id="intervalDays"
              type="number"
              step="1"
              inputMode="numeric"
              placeholder="180"
              {...register("intervalDays")}
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Input id="notes" placeholder="Opcional" {...register("notes")} />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? "Guardando…" : "Guardar recordatorio"}
      </Button>
    </form>
  );
}
