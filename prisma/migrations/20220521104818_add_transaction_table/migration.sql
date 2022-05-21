-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('CAD', 'PHP', 'USD');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('ENROLLMENT', 'STORE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('S', 'F', 'P', 'U', 'R', 'K', 'V', 'A');

-- CreateTable
CREATE TABLE "purchaseHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "purchaseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL DEFAULT E'PHP',
    "transactionStatus" "TransactionStatus" NOT NULL DEFAULT E'P',
    "paymentStatus" "TransactionStatus" NOT NULL DEFAULT E'P',
    "description" TEXT,
    "message" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transactionId_key" ON "transactions"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_referenceNumber_key" ON "transactions"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transactionId_referenceNumber_key" ON "transactions"("transactionId", "referenceNumber");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
