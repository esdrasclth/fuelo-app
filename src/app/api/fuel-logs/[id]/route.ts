import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route, parseBody } from "@/lib/api";
import { fuelLogSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export function PATCH(req: Request, { params }: Params) {
  return route(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const data = fuelLogSchema.parse(await parseBody(req));
    const totalCost =
      data.totalCost && data.totalCost > 0
        ? data.totalCost
        : Math.round(data.liters * data.pricePerLiter * 100) / 100;

    const result = await prisma.fuelLog.updateMany({
      where: { id, userId },
      data: {
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
      },
    });
    return { updated: result.count };
  });
}

export function DELETE(_req: Request, { params }: Params) {
  return route(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const result = await prisma.fuelLog.deleteMany({ where: { id, userId } });
    return { deleted: result.count };
  });
}
