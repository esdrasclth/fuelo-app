export type FuelType = "MAGNA" | "PREMIUM" | "DIESEL" | "ELECTRIC";

export type DistanceUnit = "KM" | "MI";
export type VolumeUnit = "L" | "GAL" | "KWH";

export const DISTANCE_UNIT_LABELS: Record<DistanceUnit, string> = {
  KM: "Kilómetros (km)",
  MI: "Millas (mi)",
};

export const VOLUME_UNIT_LABELS: Record<VolumeUnit, string> = {
  L: "Litros (L)",
  GAL: "Galones (gal)",
  KWH: "Kilovatios-hora (kWh)",
};

export type ReminderType =
  | "SERVICE"
  | "REFUEL"
  | "VERIFICATION"
  | "INSURANCE"
  | "OTHER";

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  MAGNA: "Magna",
  PREMIUM: "Premium",
  DIESEL: "Diésel",
  ELECTRIC: "Eléctrico",
};

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  SERVICE: "Servicio",
  REFUEL: "Recarga",
  VERIFICATION: "Verificación",
  INSURANCE: "Seguro",
  OTHER: "Otro",
};

export interface Settings {
  currency: string;
  defaultVehicleId: string | null;
  defaultStationId: string | null;
}

export interface Vehicle {
  id: string;
  name: string;
  make: string | null;
  model: string | null;
  year: number | null;
  plate: string | null;
  fuelType: FuelType;
  tankCapacity: number | null;
  distanceUnit: DistanceUnit;
  volumeUnit: VolumeUnit;
  householdId: string | null;
  household?: { id: string; name: string } | null;
  createdAt: string;
}

export interface HouseholdMemberInfo {
  id: string;
  userId: string;
  role: string;
  name: string | null;
  email: string;
}

export interface Household {
  id: string;
  name: string;
  ownerId: string;
  isOwner: boolean;
  vehicleCount: number;
  members: HouseholdMemberInfo[];
}

export interface HouseholdInvite {
  id: string;
  householdId: string;
  householdName: string;
  invitedByName: string | null;
  invitedByEmail: string;
}

export interface Station {
  id: string;
  brand: string;
  branch: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  fuelType: FuelType;
  stationId: string | null;
  isFullTank: boolean;
  missedPrevious: boolean;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  station?: Station | null;
  vehicle?: { name: string };
}

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  vehicleId: string | null;
  dueDate: string | null;
  dueOdometer: number | null;
  recurring: boolean;
  intervalDays: number | null;
  completed: boolean;
  notes: string | null;
  createdAt: string;
  vehicle?: { name: string } | null;
}

export interface Trip {
  id: string;
  name: string;
  vehicleId: string | null;
  originLabel: string;
  originLat: number;
  originLng: number;
  destLabel: string;
  destLat: number;
  destLng: number;
  distanceKm: number;
  durationMin: number | null;
  estimatedLiters: number | null;
  estimatedCost: number | null;
  roundTrip: boolean;
  createdAt: string;
  vehicle?: { name: string } | null;
}
