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

export interface EfficiencyAnomaly {
  date: string;
  kmPerL: number; // canonical
  baseline: number; // expected km/L from the trailing window
  dropPct: number; // 0..1, how far below baseline
}

/**
 * Flags intervals whose efficiency falls sharply below the recent trend — a
 * possible mechanical issue, leak, or change in driving. Each interval is
 * compared to the average of the `window` intervals before it.
 */
export function detectEfficiencyAnomalies(
  intervals: FuelInterval[],
  { window = 3, threshold = 0.2 }: { window?: number; threshold?: number } = {},
): EfficiencyAnomaly[] {
  const anomalies: EfficiencyAnomaly[] = [];
  for (let i = window; i < intervals.length; i++) {
    const prior = intervals.slice(i - window, i);
    const baseline = prior.reduce((s, p) => s + p.kmPerL, 0) / prior.length;
    if (baseline <= 0) continue;
    const current = intervals[i].kmPerL;
    const dropPct = (baseline - current) / baseline;
    if (dropPct >= threshold) {
      anomalies.push({ date: intervals[i].date, kmPerL: current, baseline, dropPct });
    }
  }
  return anomalies;
}

/**
 * Distance a full tank can cover, given capacity (liters) and average
 * efficiency (km/L). Returns canonical km, or null if either input is missing.
 */
export function fullTankRange(
  tankCapacity: number | null | undefined,
  avgKmPerL: number | null | undefined,
): number | null {
  if (!tankCapacity || tankCapacity <= 0) return null;
  if (!avgKmPerL || avgKmPerL <= 0) return null;
  return tankCapacity * avgKmPerL;
}

export interface StationPrice {
  name: string;
  avgPrice: number; // canonical per liter
  minPrice: number;
  maxPrice: number;
  fills: number;
}

/** Average (and range of) price per liter at each station, cheapest first. */
export function priceByStation(logs: FuelLog[]): StationPrice[] {
  const map = new Map<
    string,
    { sum: number; fills: number; min: number; max: number }
  >();
  for (const l of logs) {
    if (!l.station) continue;
    const name = `${l.station.brand}${l.station.branch ? ` · ${l.station.branch}` : ""}`;
    const e = map.get(name);
    if (e) {
      e.sum += l.pricePerLiter;
      e.fills += 1;
      e.min = Math.min(e.min, l.pricePerLiter);
      e.max = Math.max(e.max, l.pricePerLiter);
    } else {
      map.set(name, {
        sum: l.pricePerLiter,
        fills: 1,
        min: l.pricePerLiter,
        max: l.pricePerLiter,
      });
    }
  }
  return [...map.entries()]
    .map(([name, e]) => ({
      name,
      avgPrice: e.sum / e.fills,
      minPrice: e.min,
      maxPrice: e.max,
      fills: e.fills,
    }))
    .sort((a, b) => a.avgPrice - b.avgPrice);
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
