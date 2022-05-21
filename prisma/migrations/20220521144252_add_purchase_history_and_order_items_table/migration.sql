/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `purchaseHistory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[purchaseHistoryId]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - The required column `transactionId` was added to the `purchaseHistory` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `purchaseHistoryId` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "purchaseHistory" ADD COLUMN     "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "transactionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "purchaseHistoryId" TEXT NOT NULL,
ALTER COLUMN "transactionStatus" SET DEFAULT E'U',
ALTER COLUMN "paymentStatus" SET DEFAULT E'U';

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "basePrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "purchaseHistoryId" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchaseHistory_transactionId_key" ON "purchaseHistory"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_purchaseHistoryId_key" ON "transactions"("purchaseHistoryId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_purchaseHistoryId_fkey" FOREIGN KEY ("purchaseHistoryId") REFERENCES "purchaseHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_purchaseHistoryId_fkey" FOREIGN KEY ("purchaseHistoryId") REFERENCES "purchaseHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
