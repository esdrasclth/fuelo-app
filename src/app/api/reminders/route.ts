import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route, parseBody } from "@/lib/api";
import { reminderSchema } from "@/lib/validations";

export function GET() {
  return route(async () => {
    const userId = await requireUserId();
    return prisma.reminder.findMany({
      where: { userId },
      orderBy: [{ completed: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      include: { vehicle: { select: { name: true } } },
    });
  });
}

export function POST(req: Request) {
  return route(async () => {
    const userId = await requireUserId();
    const data = reminderSchema.parse(await parseBody(req));
    return prisma.reminder.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        vehicleId: data.vehicleId || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        dueOdometer: data.dueOdometer ?? null,
        recurring: data.recurring,
        intervalDays: data.intervalDays ?? null,
        notes: data.notes || null,
      },
    });
  });
}
