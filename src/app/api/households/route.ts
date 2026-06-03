import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route, parseBody } from "@/lib/api";
import { householdSchema } from "@/lib/validations";

export function GET() {
  return route(async () => {
    const userId = await requireUserId();
    const memberships = await prisma.householdMember.findMany({
      where: { userId },
      include: {
        household: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
            _count: { select: { vehicles: true } },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });
    return memberships.map((m) => ({
      id: m.household.id,
      name: m.household.name,
      ownerId: m.household.ownerId,
      isOwner: m.household.ownerId === userId,
      vehicleCount: m.household._count.vehicles,
      members: m.household.members.map((mem) => ({
        id: mem.id,
        userId: mem.userId,
        role: mem.role,
        name: mem.user.name,
        email: mem.user.email,
      })),
    }));
  });
}

export function POST(req: Request) {
  return route(async () => {
    const userId = await requireUserId();
    const data = householdSchema.parse(await parseBody(req));
    return prisma.household.create({
      data: {
        name: data.name,
        ownerId: userId,
        members: { create: { userId, role: "OWNER" } },
      },
    });
  });
}
