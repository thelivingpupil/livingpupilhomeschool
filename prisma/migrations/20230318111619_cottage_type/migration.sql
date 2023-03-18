-- CreateEnum
CREATE TYPE "CottageType" AS ENUM ('THREE_DAYS_A_WEEK', 'WITH_TWO_DAYS_TUTOR');

-- AlterTable
ALTER TABLE "studentRecord" ADD COLUMN     "cottageType" "CottageType";
