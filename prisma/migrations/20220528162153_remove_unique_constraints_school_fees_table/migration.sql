/*
  Warnings:

  - A unique constraint covering the columns `[studentId,transactionId]` on the table `schoolFee` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "schoolFee_studentId_key";

-- DropIndex
DROP INDEX "schoolFee_transactionId_key";

-- CreateIndex
CREATE UNIQUE INDEX "schoolFee_studentId_transactionId_key" ON "schoolFee"("studentId", "transactionId");
