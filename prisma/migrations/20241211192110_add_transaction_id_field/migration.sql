/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `requestTransaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `requestTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "requestTransaction" ADD COLUMN     "transactionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "requestTransaction_transactionId_key" ON "requestTransaction"("transactionId");
