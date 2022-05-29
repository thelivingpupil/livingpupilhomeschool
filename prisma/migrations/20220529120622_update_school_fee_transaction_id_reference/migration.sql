-- DropForeignKey
ALTER TABLE "schoolFee" DROP CONSTRAINT "schoolFee_transactionId_fkey";

-- AddForeignKey
ALTER TABLE "schoolFee" ADD CONSTRAINT "schoolFee_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
