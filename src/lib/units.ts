import type { DistanceUnit, VolumeUnit } from "@/lib/types";

export interface VehicleUnits {
  distanceUnit: DistanceUnit;
  volumeUnit: VolumeUnit;
}

export const DEFAULT_UNITS: VehicleUnits = { distanceUnit: "KM", volumeUnit: "L" };

const KM_PER_MI = 1.609344;
const L_PER_GAL = 3.785411784;

export const DISTANCE_ABBR: Record<DistanceUnit, string> = { KM: "km", MI: "mi" };
export const VOLUME_ABBR: Record<VolumeUnit, string> = {
  L: "L",
  GAL: "gal",
  KWH: "kWh",
};

// Canonical storage is always km and liters. These convert to/from a vehicle's unit.
export const distanceFromCanonical = (km: number, u: DistanceUnit) =>
  u === "MI" ? km / KM_PER_MI : km;
export const distanceToCanonical = (value: number, u: DistanceUnit) =>
  u === "MI" ? value * KM_PER_MI : value;

export const volumeFromCanonical = (liters: number, u: VolumeUnit) =>
  u === "GAL" ? liters / L_PER_GAL : liters;
export const volumeToCanonical = (value: number, u: VolumeUnit) =>
  u === "GAL" ? value * L_PER_GAL : value;

// Price is stored per liter; convert to/from price per display volume.
export const pricePerVolumeFromCanonical = (perLiter: number, u: VolumeUnit) =>
  u === "GAL" ? perLiter * L_PER_GAL : perLiter;
export const pricePerVolumeToCanonical = (perVolume: number, u: VolumeUnit) =>
  u === "GAL" ? perVolume / L_PER_GAL : perVolume;

// Efficiency stored as km/L; convert to display distance/volume (e.g. mpg).
export const efficiencyFromCanonical = (kmPerL: number, u: VehicleUnits) =>
  distanceFromCanonical(kmPerL, u.distanceUnit) / volumeFromCanonical(1, u.volumeUnit);

// Cost per km -> cost per display distance.
export const costPerDistanceFromCanonical = (perKm: number, u: DistanceUnit) =>
  perKm / distanceFromCanonical(1, u);

export const distanceLabel = (u: DistanceUnit) => DISTANCE_ABBR[u];
export const volumeLabel = (u: VolumeUnit) => VOLUME_ABBR[u];
export const efficiencyLabel = (u: VehicleUnits) =>
  `${DISTANCE_ABBR[u.distanceUnit]}/${VOLUME_ABBR[u.volumeUnit]}`;

// For aggregate views: use the shared unit when all vehicles agree, else default.
export function resolveUnits(
  vehicles?: { distanceUnit: DistanceUnit; volumeUnit: VolumeUnit }[] | null,
): VehicleUnits {
  if (!vehicles?.length) return DEFAULT_UNITS;
  const { distanceUnit, volumeUnit } = vehicles[0];
  const uniform = vehicles.every(
    (v) => v.distanceUnit === distanceUnit && v.volumeUnit === volumeUnit,
  );
  return uniform ? { distanceUnit, volumeUnit } : DEFAULT_UNITS;
}

export const unitsOf = (v?: {
  distanceUnit: DistanceUnit;
  volumeUnit: VolumeUnit;
} | null): VehicleUnits =>
  v ? { distanceUnit: v.distanceUnit, volumeUnit: v.volumeUnit } : DEFAULT_UNITS;
