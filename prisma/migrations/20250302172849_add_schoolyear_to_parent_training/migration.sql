/*
  Warnings:

  - You are about to drop the column `Status` on the `parentTraining` table. All the data in the column will be lost.
  - Added the required column `schoolYear` to the `parentTraining` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `parentTraining` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "parentTraining" DROP COLUMN "Status",
ADD COLUMN     "schoolYear" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;
