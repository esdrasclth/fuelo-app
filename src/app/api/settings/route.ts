import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { route, parseBody } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { settingsSchema } from "@/lib/validations";

export function GET() {
  return route(async () => {
    const userId = await requireUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true, defaultVehicleId: true, defaultStationId: true },
    });
    if (!user) throw new NotFoundError("Usuario no encontrado");
    return user;
  });
}

export function PATCH(req: Request) {
  return route(async () => {
    const userId = await requireUserId();
    const data = settingsSchema.parse(await parseBody(req));

    const update: {
      currency?: string;
      defaultVehicleId?: string | null;
      defaultStationId?: string | null;
    } = {};

    if (data.currency) update.currency = data.currency;

    if (data.defaultVehicleId !== undefined) {
      const id = data.defaultVehicleId || null;
      if (id) {
        const owned = await prisma.vehicle.findFirst({
          where: { id, userId },
          select: { id: true },
        });
        if (!owned) throw new NotFoundError("Vehículo no encontrado");
      }
      update.defaultVehicleId = id;
    }

    if (data.defaultStationId !== undefined) {
      const id = data.defaultStationId || null;
      if (id) {
        const owned = await prisma.station.findFirst({
          where: { id, userId },
          select: { id: true },
        });
        if (!owned) throw new NotFoundError("Gasolinera no encontrada");
      }
      update.defaultStationId = id;
    }

    return prisma.user.update({
      where: { id: userId },
      data: update,
      select: { currency: true, defaultVehicleId: true, defaultStationId: true },
    });
  });
}
