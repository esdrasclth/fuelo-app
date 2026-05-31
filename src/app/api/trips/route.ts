import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route, parseBody } from "@/lib/api";
import { tripSchema } from "@/lib/validations";

export function GET() {
  return route(async () => {
    const userId = await requireUserId();
    return prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { vehicle: { select: { name: true } } },
    });
  });
}

export function POST(req: Request) {
  return route(async () => {
    const userId = await requireUserId();
    const data = tripSchema.parse(await parseBody(req));
    return prisma.trip.create({
      data: {
        userId,
        vehicleId: data.vehicleId || null,
        name: data.name,
        originLabel: data.originLabel,
        originLat: data.originLat,
        originLng: data.originLng,
        destLabel: data.destLabel,
        destLat: data.destLat,
        destLng: data.destLng,
        distanceKm: data.distanceKm,
        durationMin: data.durationMin ?? null,
        estimatedLiters: data.estimatedLiters ?? null,
        estimatedCost: data.estimatedCost ?? null,
        roundTrip: data.roundTrip,
      },
    });
  });
}
