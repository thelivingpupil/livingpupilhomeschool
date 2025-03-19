-- AlterTable
ALTER TABLE "studentRecord" ADD COLUMN     "formerRegistrar" TEXT,
ADD COLUMN     "formerRegistrarEmail" TEXT,
ADD COLUMN     "formerRegistrarNumber" TEXT,
ADD COLUMN     "specialNeedSpecific" TEXT,
ADD COLUMN     "specialNeeds" BOOLEAN,
ADD COLUMN     "studentAddress1" TEXT,
ADD COLUMN     "studentAddress2" TEXT,
ADD COLUMN     "studentInternationalAddress" TEXT;
