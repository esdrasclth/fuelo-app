import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route } from "@/lib/api";

/** Pending household invites addressed to the signed-in user's email. */
export function GET() {
  return route(async () => {
    const userId = await requireUserId();
    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!me) return [];
    const invites = await prisma.householdInvite.findMany({
      where: { email: me.email.toLowerCase() },
      include: {
        household: { select: { id: true, name: true } },
        invitedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return invites.map((i) => ({
      id: i.id,
      householdId: i.householdId,
      householdName: i.household.name,
      invitedByName: i.invitedBy.name,
      invitedByEmail: i.invitedBy.email,
    }));
  });
}
