-- CreateEnum
CREATE TYPE "public"."DistanceUnit" AS ENUM ('KM', 'MI');

-- CreateEnum
CREATE TYPE "public"."VolumeUnit" AS ENUM ('L', 'GAL');

-- AlterTable
ALTER TABLE "public"."Vehicle" ADD COLUMN     "distanceUnit" "public"."DistanceUnit" NOT NULL DEFAULT 'KM',
ADD COLUMN     "volumeUnit" "public"."VolumeUnit" NOT NULL DEFAULT 'L';
