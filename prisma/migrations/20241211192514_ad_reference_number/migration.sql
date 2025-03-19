/*
  Warnings:

  - A unique constraint covering the columns `[referenceNumber]` on the table `requestTransaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referenceNumber` to the `requestTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "requestTransaction" ADD COLUMN     "referenceNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "requestTransaction_referenceNumber_key" ON "requestTransaction"("referenceNumber");
