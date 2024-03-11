/*
  Warnings:

  - The values [WITH_TWO_DAYS_TUTOR] on the enum `CottageType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `primaryTeacherAge` to the `studentRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryTeacherEducation` to the `studentRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryTeacherName` to the `studentRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryTeacherProfile` to the `studentRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryTeacherRelationship` to the `studentRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CottageType_new" AS ENUM ('THREE_DAYS_A_WEEK', 'FIVE_DAYS_A_WEEK');
ALTER TABLE "studentRecord" ALTER COLUMN "cottageType" TYPE "CottageType_new" USING ("cottageType"::text::"CottageType_new");
ALTER TYPE "CottageType" RENAME TO "CottageType_old";
ALTER TYPE "CottageType_new" RENAME TO "CottageType";
DROP TYPE "CottageType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "ShippingType" ADD VALUE 'PICK_UP';

-- AlterTable
ALTER TABLE "studentRecord" ADD COLUMN     "primaryTeacherAge" TEXT NOT NULL,
ADD COLUMN     "primaryTeacherEducation" TEXT NOT NULL,
ADD COLUMN     "primaryTeacherName" TEXT NOT NULL,
ADD COLUMN     "primaryTeacherProfile" TEXT NOT NULL,
ADD COLUMN     "primaryTeacherRelationship" TEXT NOT NULL;
