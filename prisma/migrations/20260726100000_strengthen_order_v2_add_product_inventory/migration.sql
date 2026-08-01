-- CreateEnum
CREATE TYPE "ShopPaymentType" AS ENUM ('FULL_PAYMENT', 'INSTALLMENT');

-- CreateEnum
CREATE TYPE "OrderV2Status" AS ENUM ('ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('RESERVE', 'COMMIT', 'RELEASE', 'RESTOCK', 'ADJUST');

-- DropForeignKey
ALTER TABLE "orderFeeV2" DROP CONSTRAINT "orderFeeV2_orderId_fkey";

-- DropForeignKey
ALTER TABLE "orderFeeV2" DROP CONSTRAINT "orderFeeV2_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "orderFeeV2" DROP CONSTRAINT "orderFeeV2_userId_fkey";

-- DropForeignKey
ALTER TABLE "orderItemV2" DROP CONSTRAINT "orderItemV2_orderedById_fkey";

-- DropForeignKey
ALTER TABLE "orderItemV2" DROP CONSTRAINT "orderItemV2_userId_fkey";

-- DropForeignKey
ALTER TABLE "orderV2" DROP CONSTRAINT "orderV2_userId_fkey";

-- DropTable
DROP TABLE "orderFeeV2";

-- DropTable
DROP TABLE "orderItemV2";

-- DropTable
DROP TABLE "orderV2";

-- CreateTable
CREATE TABLE "product" (
    "productId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "imagePath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "product_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "inventoryItem" (
    "inventoryItemId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "inventoryItem_pkey" PRIMARY KEY ("inventoryItemId")
);

-- CreateTable
CREATE TABLE "orderV2" (
    "orderId" TEXT NOT NULL,
    "orderCode" TEXT NOT NULL,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "deliveryAddress" TEXT,
    "shippingType" "ShippingType",
    "contactNumber" TEXT,
    "paymentType" "ShopPaymentType" NOT NULL,
    "status" "OrderV2Status" NOT NULL DEFAULT 'ORDER_PLACED',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "orderV2_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "orderItemV2" (
    "orderItemId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "basePrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "orderId" TEXT NOT NULL,
    "productId" TEXT,

    CONSTRAINT "orderItemV2_pkey" PRIMARY KEY ("orderItemId")
);

-- CreateTable
CREATE TABLE "orderFeeV2" (
    "orderFeeId" TEXT NOT NULL,
    "installment" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "signatureLink" TEXT,
    "status" "OrderV2Status" NOT NULL DEFAULT 'ORDER_PLACED',
    "orderId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "orderFeeV2_pkey" PRIMARY KEY ("orderFeeId")
);

-- CreateTable
CREATE TABLE "inventoryMovement" (
    "movementId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "userId" TEXT,
    "type" "InventoryMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventoryMovement_pkey" PRIMARY KEY ("movementId")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_code_key" ON "product"("code");

-- CreateIndex
CREATE INDEX "product_isActive_idx" ON "product"("isActive");

-- CreateIndex
CREATE INDEX "product_deletedAt_idx" ON "product"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "inventoryItem_productId_key" ON "inventoryItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "orderV2_orderCode_key" ON "orderV2"("orderCode");

-- CreateIndex
CREATE INDEX "orderV2_userId_idx" ON "orderV2"("userId");

-- CreateIndex
CREATE INDEX "orderV2_status_idx" ON "orderV2"("status");

-- CreateIndex
CREATE INDEX "orderV2_deletedAt_idx" ON "orderV2"("deletedAt");

-- CreateIndex
CREATE INDEX "orderItemV2_orderId_idx" ON "orderItemV2"("orderId");

-- CreateIndex
CREATE INDEX "orderItemV2_productId_idx" ON "orderItemV2"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "orderFeeV2_transactionId_key" ON "orderFeeV2"("transactionId");

-- CreateIndex
CREATE INDEX "orderFeeV2_orderId_idx" ON "orderFeeV2"("orderId");

-- CreateIndex
CREATE INDEX "orderFeeV2_status_idx" ON "orderFeeV2"("status");

-- CreateIndex
CREATE UNIQUE INDEX "orderFeeV2_orderId_installment_key" ON "orderFeeV2"("orderId", "installment");

-- CreateIndex
CREATE INDEX "inventoryMovement_inventoryItemId_idx" ON "inventoryMovement"("inventoryItemId");

-- CreateIndex
CREATE INDEX "inventoryMovement_productId_idx" ON "inventoryMovement"("productId");

-- CreateIndex
CREATE INDEX "inventoryMovement_orderItemId_idx" ON "inventoryMovement"("orderItemId");

-- CreateIndex
CREATE INDEX "inventoryMovement_createdAt_idx" ON "inventoryMovement"("createdAt");

-- AddForeignKey
ALTER TABLE "inventoryItem" ADD CONSTRAINT "inventoryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderV2" ADD CONSTRAINT "orderV2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItemV2" ADD CONSTRAINT "orderItemV2_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orderV2"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItemV2" ADD CONSTRAINT "orderItemV2_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderFeeV2" ADD CONSTRAINT "orderFeeV2_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactionV2"("transactionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderFeeV2" ADD CONSTRAINT "orderFeeV2_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orderV2"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventoryMovement" ADD CONSTRAINT "inventoryMovement_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventoryItem"("inventoryItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventoryMovement" ADD CONSTRAINT "inventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventoryMovement" ADD CONSTRAINT "inventoryMovement_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "orderItemV2"("orderItemId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventoryMovement" ADD CONSTRAINT "inventoryMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
