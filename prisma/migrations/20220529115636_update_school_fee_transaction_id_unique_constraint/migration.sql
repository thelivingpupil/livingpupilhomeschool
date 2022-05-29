/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `schoolFee` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "schoolFee_transactionId_key" ON "schoolFee"("transactionId");
