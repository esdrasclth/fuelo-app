import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";

type Params = { params: Promise<{ id: string }> };

async function loadOwnInvite(userId: string, inviteId: string) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  const invite = await prisma.householdInvite.findUnique({
    where: { id: inviteId },
  });
  if (!invite || !me || invite.email !== me.email.toLowerCase()) {
    throw new NotFoundError("Invitación no encontrada");
  }
  return invite;
}

/** Accept an invite: join the household and discard the invite. */
export function POST(_req: Request, { params }: Params) {
  return route(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const invite = await loadOwnInvite(userId, id);

    await prisma.$transaction([
      prisma.householdMember.upsert({
        where: {
          householdId_userId: { householdId: invite.householdId, userId },
        },
        create: { householdId: invite.householdId, userId, role: "MEMBER" },
        update: {},
      }),
      prisma.householdInvite.delete({ where: { id } }),
    ]);
    return { joined: true };
  });
}

/** Decline an invite. */
export function DELETE(_req: Request, { params }: Params) {
  return route(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    await loadOwnInvite(userId, id);
    await prisma.householdInvite.delete({ where: { id } });
    return { declined: true };
  });
}
