/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `documentRequest` will be added. If there are existing duplicate values, this will fail.
  - The required column `transactionId` was added to the `documentRequest` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "documentRequest" DROP CONSTRAINT "documentRequest_transaction_fk";

-- DropIndex
DROP INDEX "documentRequest_id_requestCode_key";

-- AlterTable
ALTER TABLE "documentRequest" ADD COLUMN     "transactionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "documentRequest_transactionId_key" ON "documentRequest"("transactionId");

-- AddForeignKey
ALTER TABLE "documentRequest" ADD CONSTRAINT "documentRequest_transaction_fk" FOREIGN KEY ("transactionId") REFERENCES "transactions"("transactionId") ON DELETE CASCADE ON UPDATE CASCADE;
