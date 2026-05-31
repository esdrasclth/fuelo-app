import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route, parseBody } from "@/lib/api";
import { vehicleSchema } from "@/lib/validations";

export function GET() {
  return route(async () => {
    const userId = await requireUserId();
    return prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  });
}

export function POST(req: Request) {
  return route(async () => {
    const userId = await requireUserId();
    const data = vehicleSchema.parse(await parseBody(req));
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
      },
    });
  });
}
