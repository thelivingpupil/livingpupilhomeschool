-- CreateEnum
CREATE TYPE "ShippingType" AS ENUM ('WITHIN_CEBU', 'NCR', 'NORTH_LUZON', 'SOUTH_LUZON', 'VISAYAS', 'MINDANAO', 'ISLANDER');

-- AlterTable
ALTER TABLE "purchaseHistory" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "shippingType" "ShippingType";
