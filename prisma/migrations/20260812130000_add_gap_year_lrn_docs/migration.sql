-- CreateEnum
CREATE TYPE "PreviousSchoolType" AS ENUM ('INTERNATIONAL', 'LOCAL');

-- AlterTable
ALTER TABLE "studentRecord" ADD COLUMN "previousSchoolType" "PreviousSchoolType",
ADD COLUMN "gapYearAgreement" TEXT,
ADD COLUMN "lrnProvisionForm" TEXT;
