/*
  Warnings:

  - You are about to drop the column `balance` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "balance",
ADD COLUMN     "payment" DECIMAL(65,30);
