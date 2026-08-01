-- CreateEnum
CREATE TYPE "PartnerSchool" AS ENUM ('KAIROS', 'MANDAUE');

-- AlterTable
ALTER TABLE "studentRecord" ADD COLUMN "partnerSchool" "PartnerSchool";
