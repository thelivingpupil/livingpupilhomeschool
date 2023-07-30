/*
  Warnings:

  - The values [WITH_TWO_DAYS_TUTOR] on the enum `CottageType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CottageType_new" AS ENUM ('THREE_DAYS_A_WEEK', 'FIVE_DAYS_A_WEEK');
ALTER TABLE "studentRecord" ALTER COLUMN "cottageType" TYPE "CottageType_new" USING ("cottageType"::text::"CottageType_new");
ALTER TYPE "CottageType" RENAME TO "CottageType_old";
ALTER TYPE "CottageType_new" RENAME TO "CottageType";
DROP TYPE "CottageType_old";
COMMIT;
