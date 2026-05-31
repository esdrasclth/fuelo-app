import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Ingresa tu nombre").max(80),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const fuelTypeEnum = z.enum(["MAGNA", "PREMIUM", "DIESEL"]);

export const vehicleSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(80),
  make: z.string().max(60).optional().or(z.literal("")),
  model: z.string().max(60).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  plate: z.string().max(20).optional().or(z.literal("")),
  fuelType: fuelTypeEnum.default("MAGNA"),
  tankCapacity: z.coerce.number().positive().max(500).optional(),
  distanceUnit: z.enum(["KM", "MI"]).default("KM"),
  volumeUnit: z.enum(["L", "GAL"]).default("L"),
});

export const stationSchema = z.object({
  brand: z.string().min(1, "Marca requerida").max(60),
  branch: z.string().max(80).optional().or(z.literal("")),
  address: z.string().max(160).optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const fuelLogSchema = z.object({
  clientId: z.string().uuid().optional(),
  vehicleId: z.string().min(1, "Selecciona un vehículo"),
  date: z.string().min(1, "Fecha requerida"),
  odometer: z.coerce.number().nonnegative("KM inválido"),
  liters: z.coerce.number().positive("Litros inválidos"),
  pricePerLiter: z.coerce.number().positive("Precio inválido"),
  totalCost: z.coerce.number().nonnegative().optional(),
  fuelType: fuelTypeEnum.default("MAGNA"),
  stationId: z.string().optional().or(z.literal("")),
  isFullTank: z.boolean().default(true),
  missedPrevious: z.boolean().default(false),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  notes: z.string().max(300).optional().or(z.literal("")),
});

export const reminderSchema = z.object({
  type: z
    .enum(["SERVICE", "REFUEL", "VERIFICATION", "INSURANCE", "OTHER"])
    .default("SERVICE"),
  title: z.string().min(1, "Título requerido").max(120),
  vehicleId: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  dueOdometer: z.coerce.number().nonnegative().optional(),
  recurring: z.boolean().default(false),
  intervalDays: z.coerce.number().int().positive().optional(),
  notes: z.string().max(300).optional().or(z.literal("")),
});

export const reminderUpdateSchema = reminderSchema.partial().extend({
  completed: z.boolean().optional(),
});

export const tripSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(120),
  vehicleId: z.string().optional().or(z.literal("")),
  originLabel: z.string().min(1),
  originLat: z.coerce.number(),
  originLng: z.coerce.number(),
  destLabel: z.string().min(1),
  destLat: z.coerce.number(),
  destLng: z.coerce.number(),
  distanceKm: z.coerce.number().positive(),
  durationMin: z.coerce.number().optional(),
  estimatedLiters: z.coerce.number().optional(),
  estimatedCost: z.coerce.number().optional(),
  roundTrip: z.boolean().default(false),
});
