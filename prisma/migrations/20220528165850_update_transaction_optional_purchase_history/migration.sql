-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_purchaseHistoryId_fkey";

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "purchaseHistoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_purchaseHistoryId_fkey" FOREIGN KEY ("purchaseHistoryId") REFERENCES "purchaseHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
