import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route, parseBody } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { fuelLogSchema } from "@/lib/validations";
import { accessibleVehicleIds } from "@/lib/access";

export function GET(req: Request) {
  return route(async () => {
    const userId = await requireUserId();
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId") || undefined;
    const ids = await accessibleVehicleIds(userId);
    const allowed = vehicleId
      ? ids.filter((id) => id === vehicleId)
      : ids;
    return prisma.fuelLog.findMany({
      where: { vehicleId: { in: allowed } },
      orderBy: { date: "desc" },
      include: { station: true, vehicle: { select: { name: true } } },
    });
  });
}

export function POST(req: Request) {
  return route(async () => {
    const userId = await requireUserId();
    const data = fuelLogSchema.parse(await parseBody(req));

    // Allow logging fuel on any vehicle the user can access (owned or shared).
    const ids = await accessibleVehicleIds(userId);
    if (!ids.includes(data.vehicleId)) {
      throw new NotFoundError("Vehículo no encontrado");
    }

    const totalCost =
      data.totalCost && data.totalCost > 0
        ? data.totalCost
        : Math.round(data.liters * data.pricePerLiter * 100) / 100;

    const values = {
      userId,
      vehicleId: data.vehicleId,
      date: new Date(data.date),
      odometer: data.odometer,
      liters: data.liters,
      pricePerLiter: data.pricePerLiter,
      totalCost,
      fuelType: data.fuelType,
      stationId: data.stationId || null,
      isFullTank: data.isFullTank,
      missedPrevious: data.missedPrevious,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      notes: data.notes || null,
    };

    // Offline replays carry a client-generated id — upsert keeps them idempotent.
    // Guard against id collisions with another user's log: a bare upsert would
    // overwrite their row (and reassign its userId) since the unique `where`
    // can't be scoped by userId.
    if (data.clientId) {
      const existing = await prisma.fuelLog.findUnique({
        where: { id: data.clientId },
        select: { userId: true },
      });
      if (existing && existing.userId !== userId) {
        throw new NotFoundError("Carga no encontrada");
      }
      return prisma.fuelLog.upsert({
        where: { id: data.clientId },
        create: { id: data.clientId, ...values },
        update: values,
      });
    }

    return prisma.fuelLog.create({ data: values });
  });
}
