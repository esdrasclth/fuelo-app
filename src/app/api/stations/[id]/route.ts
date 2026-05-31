import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route, parseBody } from "@/lib/api";
import { stationSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export function PATCH(req: Request, { params }: Params) {
  return route(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const data = stationSchema.parse(await parseBody(req));
    const result = await prisma.station.updateMany({
      where: { id, userId },
      data: {
        brand: data.brand,
        branch: data.branch || null,
        address: data.address || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      },
    });
    return { updated: result.count };
  });
}

export function DELETE(_req: Request, { params }: Params) {
  return route(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const result = await prisma.station.deleteMany({ where: { id, userId } });
    return { deleted: result.count };
  });
}
