-- CreateEnum
CREATE TYPE "District" AS ENUM ('LUZON', 'CEBU', 'MINDANAO');

-- AlterTable
ALTER TABLE "studentRecord" ADD COLUMN "district" "District";
