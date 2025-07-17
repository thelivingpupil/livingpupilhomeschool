/*
  Warnings:

  - You are about to drop the column `idPicture` on the `studentRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "studentRecord" DROP COLUMN "idPicture",
ADD COLUMN     "idPictureBack" TEXT,
ADD COLUMN     "idPictureFront" TEXT;
