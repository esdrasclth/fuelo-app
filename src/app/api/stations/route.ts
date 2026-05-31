import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route, parseBody } from "@/lib/api";
import { stationSchema } from "@/lib/validations";

export function GET() {
  return route(async () => {
    const userId = await requireUserId();
    return prisma.station.findMany({
      where: { userId },
      orderBy: { brand: "asc" },
    });
  });
}

export function POST(req: Request) {
  return route(async () => {
    const userId = await requireUserId();
    const data = stationSchema.parse(await parseBody(req));
    return prisma.station.create({
      data: {
        userId,
        brand: data.brand,
        branch: data.branch || null,
        address: data.address || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      },
    });
  });
}
