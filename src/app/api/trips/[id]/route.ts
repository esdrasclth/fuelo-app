import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export function DELETE(_req: Request, { params }: Params) {
  return route(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const result = await prisma.trip.deleteMany({ where: { id, userId } });
    return { deleted: result.count };
  });
}
