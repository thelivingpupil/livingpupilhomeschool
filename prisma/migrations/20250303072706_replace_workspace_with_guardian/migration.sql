/*
  Warnings:

  - You are about to drop the column `workspaceCode` on the `parentTraining` table. All the data in the column will be lost.
  - Added the required column `guardianId` to the `parentTraining` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "parentTraining" DROP CONSTRAINT "parentTraining_workspaceCode_fkey";

-- AlterTable
ALTER TABLE "parentTraining" DROP COLUMN "workspaceCode",
ADD COLUMN     "guardianId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "parentTraining" ADD CONSTRAINT "parentTraining_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "guardianInformation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
