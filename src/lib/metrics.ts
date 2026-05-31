import type { FuelLog } from "@/lib/types";

export interface FuelInterval {
  date: string;
  distance: number;
  liters: number;
  cost: number;
  kmPerL: number;
  costPerKm: number;
  pricePerLiter: number;
}

export interface FuelStats {
  fills: number;
  totalSpent: number;
  totalLiters: number;
  avgPricePerLiter: number;
  lastPricePerLiter: number | null;
  totalDistance: number;
  avgKmPerL: number | null;
  bestKmPerL: number | null;
  worstKmPerL: number | null;
  avgCostPerKm: number | null;
  intervals: FuelInterval[];
}

/**
 * Full-to-full consumption method. Fuel used between two full-tank fills equals
 * the fuel added after the first full tank up to (and including) the second,
 * across the distance between their odometer readings.
 */
export function computeFuelStats(logs: FuelLog[]): FuelStats {
  const sorted = [...logs].sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime() ||
      a.odometer - b.odometer,
  );

  const intervals: FuelInterval[] = [];
  let lastFull: FuelLog | null = null;
  let litersSinceFull = 0;
  let costSinceFull = 0;

  for (const log of sorted) {
    litersSinceFull += log.liters;
    costSinceFull += log.totalCost;

    if (log.isFullTank) {
      if (
        lastFull &&
        !log.missedPrevious &&
        log.odometer > lastFull.odometer &&
        litersSinceFull > 0
      ) {
        const distance = log.odometer - lastFull.odometer;
        intervals.push({
          date: log.date,
          distance,
          liters: litersSinceFull,
          cost: costSinceFull,
          kmPerL: distance / litersSinceFull,
          costPerKm: costSinceFull / distance,
          pricePerLiter: log.pricePerLiter,
        });
      }
      lastFull = log;
      litersSinceFull = 0;
      costSinceFull = 0;
    }
  }

  const totalSpent = logs.reduce((s, l) => s + l.totalCost, 0);
  const totalLiters = logs.reduce((s, l) => s + l.liters, 0);
  const kmPerLValues = intervals.map((i) => i.kmPerL);
  const intervalDistance = intervals.reduce((s, i) => s + i.distance, 0);
  const intervalLiters = intervals.reduce((s, i) => s + i.liters, 0);
  const intervalCost = intervals.reduce((s, i) => s + i.cost, 0);

  return {
    fills: logs.length,
    totalSpent,
    totalLiters,
    avgPricePerLiter: totalLiters > 0 ? totalSpent / totalLiters : 0,
    lastPricePerLiter: sorted.length
      ? sorted[sorted.length - 1].pricePerLiter
      : null,
    totalDistance: intervalDistance,
    avgKmPerL: intervalLiters > 0 ? intervalDistance / intervalLiters : null,
    bestKmPerL: kmPerLValues.length ? Math.max(...kmPerLValues) : null,
    worstKmPerL: kmPerLValues.length ? Math.min(...kmPerLValues) : null,
    avgCostPerKm: intervalDistance > 0 ? intervalCost / intervalDistance : null,
    intervals,
  };
}

export interface MonthlyPoint {
  month: string; // YYYY-MM
  label: string; // e.g. "may 26"
  spent: number;
  liters: number;
}

export function monthlySpend(logs: FuelLog[]): MonthlyPoint[] {
  const map = new Map<string, MonthlyPoint>();
  for (const l of logs) {
    const d = new Date(l.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = map.get(key);
    if (existing) {
      existing.spent += l.totalCost;
      existing.liters += l.liters;
    } else {
      map.set(key, {
        month: key,
        label: d.toLocaleDateString("es-MX", {
          month: "short",
          year: "2-digit",
        }),
        spent: l.totalCost,
        liters: l.liters,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export interface StationSpend {
  name: string;
  spent: number;
  fills: number;
}

export function spendByStation(
  logs: FuelLog[],
): StationSpend[] {
  const map = new Map<string, StationSpend>();
  for (const l of logs) {
    const name = l.station
      ? `${l.station.brand}${l.station.branch ? ` · ${l.station.branch}` : ""}`
      : "Sin gasolinera";
    const existing = map.get(name);
    if (existing) {
      existing.spent += l.totalCost;
      existing.fills += 1;
    } else {
      map.set(name, { name, spent: l.totalCost, fills: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.spent - a.spent);
}

/** Estimate fuel cost for a trip given distance, efficiency and price. */
export function estimateTripCost(
  distanceKm: number,
  kmPerL: number,
  pricePerLiter: number,
  roundTrip = false,
): { liters: number; cost: number; distance: number } {
  const distance = roundTrip ? distanceKm * 2 : distanceKm;
  const liters = kmPerL > 0 ? distance / kmPerL : 0;
  const cost = liters * pricePerLiter;
  return {
    liters: Math.round(liters * 100) / 100,
    cost: Math.round(cost * 100) / 100,
    distance,
  };
}
