-- AlterTable
ALTER TABLE "cottageSlots" ADD COLUMN "schoolYear" TEXT NOT NULL DEFAULT '2026-2027';

-- DropIndex
DROP INDEX "cottageSlots_gradeTarget_cottageSlotName_key";

-- CreateIndex
CREATE UNIQUE INDEX "cottageSlots_schoolYear_gradeTarget_cottageSlotName_key" ON "cottageSlots"("schoolYear", "gradeTarget", "cottageSlotName");

-- Remove default so new rows must set schoolYear explicitly
ALTER TABLE "cottageSlots" ALTER COLUMN "schoolYear" DROP DEFAULT;
