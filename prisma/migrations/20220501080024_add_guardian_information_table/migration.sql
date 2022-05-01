-- CreateEnum
CREATE TYPE "GuardianType" AS ENUM ('MOTHER', 'FATHER', 'LEGAL_GUARDIAN');

-- CreateTable
CREATE TABLE "guardianInformation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "primaryGuardianName" TEXT,
    "primaryGuardianOccupation" TEXT,
    "primaryGuardianType" "GuardianType" DEFAULT E'LEGAL_GUARDIAN',
    "primaryGuardianProfile" TEXT,
    "secondaryGuardianName" TEXT,
    "secondaryGuardianOccupation" TEXT,
    "secondaryGuardianType" "GuardianType" DEFAULT E'LEGAL_GUARDIAN',
    "secondaryGuardianProfile" TEXT,
    "mobileNumber" TEXT,
    "telephoneNumber" TEXT,
    "anotherEmail" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "guardianInformation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guardianInformation_userId_key" ON "guardianInformation"("userId");

-- AddForeignKey
ALTER TABLE "guardianInformation" ADD CONSTRAINT "guardianInformation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
