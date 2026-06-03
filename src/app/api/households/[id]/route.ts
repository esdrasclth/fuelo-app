import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";

type Params = { params: Promise<{ id: string }> };

/** Owner deletes the household; any other member leaves it. */
export function DELETE(_req: Request, { params }: Params) {
  return route(async () => {
    const userId = await requireUserId();
    const { id } = await params;

    const household = await prisma.household.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!household) throw new NotFoundError("Hogar no encontrado");

    if (household.ownerId === userId) {
      await prisma.household.delete({ where: { id } });
      return { deleted: true };
    }

    const result = await prisma.householdMember.deleteMany({
      where: { householdId: id, userId },
    });
    if (result.count === 0) throw new NotFoundError("No perteneces a este hogar");
    return { left: true };
  });
}
