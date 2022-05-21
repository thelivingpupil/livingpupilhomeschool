-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "source" "TransactionSource" NOT NULL DEFAULT E'STORE';
