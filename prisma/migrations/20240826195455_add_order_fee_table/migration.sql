/*
  Warnings:

  - You are about to drop the column `code` on the `purchaseHistory` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `purchaseHistory` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `purchaseHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "purchaseHistory" DROP COLUMN "code",
DROP COLUMN "order",
DROP COLUMN "paymentType";

-- CreateTable
CREATE TABLE "orderFee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL,

    CONSTRAINT "orderFee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orderFee_transactionId_key" ON "orderFee"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "orderFee_userId_transactionId_key" ON "orderFee"("userId", "transactionId");

-- AddForeignKey
ALTER TABLE "orderFee" ADD CONSTRAINT "orderFee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderFee" ADD CONSTRAINT "orderFee_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("transactionId") ON DELETE RESTRICT ON UPDATE CASCADE;
