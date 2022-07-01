-- CreateEnum
CREATE TYPE "Fees" AS ENUM ('ONLINE', 'OTC', 'PAYMENT_CENTERS');

-- AlterTable
ALTER TABLE "studentRecord" ADD COLUMN     "image" TEXT,
ADD COLUMN     "liveBirthCertificate" TEXT,
ADD COLUMN     "reportCard" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "fee" "Fees" NOT NULL DEFAULT E'ONLINE';
