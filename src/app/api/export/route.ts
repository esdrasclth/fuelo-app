import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { requireUserId, UnauthorizedError } from "@/lib/session";
import { FUEL_TYPE_LABELS } from "@/lib/types";

export async function GET() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (e) {
    if (e instanceof UnauthorizedError)
      return new Response("No autorizado", { status: 401 });
    throw e;
  }

  const logs = await prisma.fuelLog.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    include: {
      vehicle: { select: { name: true } },
      station: { select: { brand: true, branch: true } },
    },
  });

  const rows = logs.map((l) => ({
    Fecha: l.date.toISOString(),
    Vehiculo: l.vehicle.name,
    Odometro_km: l.odometer,
    Litros: l.liters,
    Precio_por_litro: l.pricePerLiter,
    Total: l.totalCost,
    Tipo: FUEL_TYPE_LABELS[l.fuelType],
    Gasolinera: l.station
      ? `${l.station.brand}${l.station.branch ? ` - ${l.station.branch}` : ""}`
      : "",
    Tanque_lleno: l.isFullTank ? "Si" : "No",
    Notas: l.notes ?? "",
  }));

  const csv = Papa.unparse(rows);
  const filename = `fuelo-cargas-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
