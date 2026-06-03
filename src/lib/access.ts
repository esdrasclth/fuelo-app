import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Household ids the user is a member of. */
export async function userHouseholdIds(userId: string): Promise<string[]> {
  const members = await prisma.householdMember.findMany({
    where: { userId },
    select: { householdId: true },
  });
  return members.map((m) => m.householdId);
}

/**
 * Prisma `where` matching every vehicle the user can see: the ones they own
 * plus any shared into a household they belong to.
 */
export async function accessibleVehicleWhere(
  userId: string,
): Promise<Prisma.VehicleWhereInput> {
  const householdIds = await userHouseholdIds(userId);
  return householdIds.length
    ? { OR: [{ userId }, { householdId: { in: householdIds } }] }
    : { userId };
}

/** Ids of all vehicles the user can see (owned + shared via household). */
export async function accessibleVehicleIds(userId: string): Promise<string[]> {
  const where = await accessibleVehicleWhere(userId);
  const vehicles = await prisma.vehicle.findMany({
    where,
    select: { id: true },
  });
  return vehicles.map((v) => v.id);
}

/** True if the user owns or shares access to the given vehicle. */
export async function canAccessVehicle(
  userId: string,
  vehicleId: string,
): Promise<boolean> {
  const where = await accessibleVehicleWhere(userId);
  const vehicle = await prisma.vehicle.findFirst({
    where: { AND: [{ id: vehicleId }, where] },
    select: { id: true },
  });
  return vehicle != null;
}
