/*
  Warnings:

  - You are about to drop the column `docFee` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `processingTime` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `requirement` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the `uploadedDocuments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `url` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "uploadedDocuments" DROP CONSTRAINT "documents_documentRequest_fk";

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "docFee",
DROP COLUMN "processingTime",
DROP COLUMN "requirement",
ADD COLUMN     "url" TEXT NOT NULL;

-- DropTable
DROP TABLE "uploadedDocuments";
