import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route, parseBody } from "@/lib/api";
import { reminderUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export function PATCH(req: Request, { params }: Params) {
  return route(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const data = reminderUpdateSchema.parse(await parseBody(req));

    const update: Prisma.ReminderUncheckedUpdateManyInput = {};
    if (data.type !== undefined) update.type = data.type;
    if (data.title !== undefined) update.title = data.title;
    if (data.vehicleId !== undefined) update.vehicleId = data.vehicleId || null;
    if (data.dueDate !== undefined)
      update.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.dueOdometer !== undefined)
      update.dueOdometer = data.dueOdometer ?? null;
    if (data.recurring !== undefined) update.recurring = data.recurring;
    if (data.intervalDays !== undefined)
      update.intervalDays = data.intervalDays ?? null;
    if (data.notes !== undefined) update.notes = data.notes || null;
    if (data.completed !== undefined) update.completed = data.completed;

    const result = await prisma.reminder.updateMany({
      where: { id, userId },
      data: update,
    });
    return { updated: result.count };
  });
}

export function DELETE(_req: Request, { params }: Params) {
  return route(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const result = await prisma.reminder.deleteMany({ where: { id, userId } });
    return { deleted: result.count };
  });
}
