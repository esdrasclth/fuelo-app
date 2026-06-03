import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route, parseBody } from "@/lib/api";
import { vehicleSchema } from "@/lib/validations";
import { accessibleVehicleWhere, userHouseholdIds } from "@/lib/access";
import { BadRequestError } from "@/lib/errors";

export function GET() {
  return route(async () => {
    const userId = await requireUserId();
    const where = await accessibleVehicleWhere(userId);
    return prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: { household: { select: { id: true, name: true } } },
    });
  });
}

export function POST(req: Request) {
  return route(async () => {
    const userId = await requireUserId();
    const data = vehicleSchema.parse(await parseBody(req));
    let householdId: string | null = null;
    if (data.householdId) {
      const ids = await userHouseholdIds(userId);
      if (!ids.includes(data.householdId)) {
        throw new BadRequestError("Hogar no válido");
      }
      householdId = data.householdId;
    }
    return prisma.vehicle.create({
      data: {
        userId,
        name: data.name,
        make: data.make || null,
        model: data.model || null,
        year: data.year ?? null,
        plate: data.plate || null,
        fuelType: data.fuelType,
        tankCapacity: data.tankCapacity ?? null,
        distanceUnit: data.distanceUnit,
        volumeUnit: data.volumeUnit,
        householdId,
      },
    });
  });
}
