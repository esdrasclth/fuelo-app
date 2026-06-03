-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'HNL',
ADD COLUMN     "defaultVehicleId" TEXT,
ADD COLUMN     "defaultStationId" TEXT;
