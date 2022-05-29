/*
  Warnings:

  - Added the required column `order` to the `schoolFee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schoolFee" ADD COLUMN     "order" INTEGER NOT NULL;
