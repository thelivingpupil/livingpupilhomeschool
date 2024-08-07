-- CreateEnum
CREATE TYPE "studentStatus" AS ENUM ('ENROLLED', 'PENDING', 'DROPPED');

-- AlterTable
ALTER TABLE "studentRecord" ADD COLUMN     "studentStatus" TEXT;
