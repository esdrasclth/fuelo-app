import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route, parseBody } from "@/lib/api";
import { inviteSchema } from "@/lib/validations";
import { BadRequestError, NotFoundError } from "@/lib/errors";

type Params = { params: Promise<{ id: string }> };

/** Household owner invites someone by email. No email is sent — the invitee
 *  sees the pending invite when they sign in with that address. */
export function POST(req: Request, { params }: Params) {
  return route(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const data = inviteSchema.parse(await parseBody(req));
    const email = data.email.toLowerCase();

    const household = await prisma.household.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!household) throw new NotFoundError("Hogar no encontrado");
    if (household.ownerId !== userId) {
      throw new NotFoundError("Hogar no encontrado");
    }

    const invited = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (invited) {
      const already = await prisma.householdMember.findUnique({
        where: { householdId_userId: { householdId: id, userId: invited.id } },
        select: { id: true },
      });
      if (already) throw new BadRequestError("Ya es miembro del hogar");
    }

    await prisma.householdInvite.upsert({
      where: { householdId_email: { householdId: id, email } },
      create: { householdId: id, email, invitedById: userId },
      update: { invitedById: userId },
    });
    return { invited: true };
  });
}
