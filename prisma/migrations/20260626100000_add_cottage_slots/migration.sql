-- CreateEnum
CREATE TYPE "CottageSlotGradeTarget" AS ENUM ('K2', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'FORM_1', 'FORM_2', 'FORM_3');

-- CreateTable
CREATE TABLE "cottageSlots" (
    "id" TEXT NOT NULL,
    "cottageSlotName" TEXT NOT NULL,
    "gradeTarget" "CottageSlotGradeTarget" NOT NULL,
    "timeslot" TEXT NOT NULL,
    "slots" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cottageSlots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cottageSlots_gradeTarget_cottageSlotName_key" ON "cottageSlots"("gradeTarget", "cottageSlotName");

-- AlterTable
ALTER TABLE "studentRecord" ADD COLUMN "cottageSlotId" TEXT;

-- AddForeignKey
ALTER TABLE "studentRecord" ADD CONSTRAINT "studentRecord_cottageSlotId_fkey" FOREIGN KEY ("cottageSlotId") REFERENCES "cottageSlots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
