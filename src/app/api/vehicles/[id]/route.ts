import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route, parseBody } from "@/lib/api";
import { vehicleSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export function PATCH(req: Request, { params }: Params) {
  return route(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const data = vehicleSchema.parse(await parseBody(req));
    const result = await prisma.vehicle.updateMany({
      where: { id, userId },
      data: {
        name: data.name,
        make: data.make || null,
        model: data.model || null,
        year: data.year ?? null,
        plate: data.plate || null,
        fuelType: data.fuelType,
        tankCapacity: data.tankCapacity ?? null,
        distanceUnit: data.distanceUnit,
        volumeUnit: data.volumeUnit,
      },
    });
    return { updated: result.count };
  });
}

export function DELETE(_req: Request, { params }: Params) {
  return route(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const result = await prisma.vehicle.deleteMany({ where: { id, userId } });
    return { deleted: result.count };
  });
}
