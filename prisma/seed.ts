import { PrismaClient, FuelType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@fuelo.app" },
    update: {},
    create: {
      email: "demo@fuelo.app",
      name: "Demo Fuelo",
      passwordHash,
    },
  });

  // Clean prior demo data so the seed is idempotent
  await prisma.fuelLog.deleteMany({ where: { userId: user.id } });
  await prisma.station.deleteMany({ where: { userId: user.id } });
  await prisma.vehicle.deleteMany({ where: { userId: user.id } });

  const vehicle = await prisma.vehicle.create({
    data: {
      userId: user.id,
      name: "Mi Auto",
      make: "Nissan",
      model: "Versa",
      year: 2020,
      plate: "ABC-123",
      fuelType: FuelType.MAGNA,
      tankCapacity: 41,
    },
  });

  const pemex = await prisma.station.create({
    data: {
      userId: user.id,
      brand: "Pemex",
      branch: "Av. Universidad",
      latitude: 19.3578,
      longitude: -99.1832,
    },
  });

  const bp = await prisma.station.create({
    data: {
      userId: user.id,
      brand: "BP",
      branch: "Insurgentes Sur",
      latitude: 19.37,
      longitude: -99.18,
    },
  });

  const fills = [
    { days: 40, odo: 30000, liters: 40, price: 22.5, station: pemex.id },
    { days: 30, odo: 30420, liters: 32, price: 22.8, station: bp.id },
    { days: 20, odo: 30850, liters: 35, price: 23.1, station: pemex.id },
    { days: 10, odo: 31300, liters: 36, price: 23.4, station: bp.id },
    { days: 2, odo: 31720, liters: 33, price: 23.6, station: pemex.id },
  ];

  for (const f of fills) {
    const date = new Date();
    date.setDate(date.getDate() - f.days);
    await prisma.fuelLog.create({
      data: {
        userId: user.id,
        vehicleId: vehicle.id,
        stationId: f.station,
        date,
        odometer: f.odo,
        liters: f.liters,
        pricePerLiter: f.price,
        totalCost: Math.round(f.liters * f.price * 100) / 100,
        fuelType: FuelType.MAGNA,
        isFullTank: true,
      },
    });
  }

  console.log("Seed completo. Usuario demo: demo@fuelo.app / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
