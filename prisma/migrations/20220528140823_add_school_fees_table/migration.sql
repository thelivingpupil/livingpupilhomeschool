-- CreateEnum
CREATE TYPE "Accreditation" AS ENUM ('LOCAL', 'INTERNATIONAL', 'DUAL', 'FORM_ONE', 'FORM_TWO');

-- CreateEnum
CREATE TYPE "Enrollment" AS ENUM ('CONTINUING', 'NEW');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('FEMALE', 'MALE');

-- CreateEnum
CREATE TYPE "GradeLevel" AS ENUM ('PRESCHOOL', 'K1', 'K2', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ANNUAL', 'SEMI_ANNUAL', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "Program" AS ENUM ('HOMESCHOOL_PROGRAM', 'HOMESCHOOL_COTTAGE');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('ROMAN_CATHOLIC', 'MUSLIM', 'BORN_AGAIN_CHRISTIAN', 'SEVENT_DAY_ADVENTIST', 'IGLESIA_NI_CRISTO', 'LATTER_DAY_SAINTS_MORMONS', 'OTHERS');

-- CreateTable
CREATE TABLE "schoolFee" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "schoolFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studentRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "religion" "Religion" NOT NULL,
    "incomingGradeLevel" "GradeLevel" NOT NULL,
    "enrollmentType" "Enrollment" NOT NULL DEFAULT E'NEW',
    "program" "Program" NOT NULL DEFAULT E'HOMESCHOOL_PROGRAM',
    "accreditation" "Accreditation" NOT NULL DEFAULT E'LOCAL',
    "reason" TEXT,
    "formerSchoolName" TEXT NOT NULL,
    "formerSchoolAddress" TEXT NOT NULL,

    CONSTRAINT "studentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schoolFee_studentId_key" ON "schoolFee"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "schoolFee_transactionId_key" ON "schoolFee"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "studentRecord_studentId_key" ON "studentRecord"("studentId");

-- AddForeignKey
ALTER TABLE "schoolFee" ADD CONSTRAINT "schoolFee_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schoolFee" ADD CONSTRAINT "schoolFee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studentRecord" ADD CONSTRAINT "studentRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
