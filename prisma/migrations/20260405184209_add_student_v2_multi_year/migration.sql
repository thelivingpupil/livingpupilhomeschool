-- CreateEnum
CREATE TYPE "EnrollmentTypeV2" AS ENUM ('CONTINUING', 'NEW');

-- CreateEnum
CREATE TYPE "EnrollmentStatusV2" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_studentId_fkey";

-- CreateTable
CREATE TABLE "schoolYearV2" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "earlyEnrollDate" TIMESTAMP(3),
    "isOpenEarly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,

    CONSTRAINT "schoolYearV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studentV2" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lrn" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "religion" "Religion" NOT NULL,
    "liveBirthCertificate" TEXT NOT NULL,
    "idPictureBack" TEXT NOT NULL,
    "idPictureFront" TEXT NOT NULL,
    "studentAddress1" TEXT NOT NULL,
    "studentAddress2" TEXT NOT NULL,
    "studentInternationalAddress" TEXT NOT NULL,
    "specialNeeds" TEXT NOT NULL,
    "specialNeedsSpecific" TEXT NOT NULL,
    "studentStatus" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "studentV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaceV2" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "workspaceCode" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "creatorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "workspaceV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollmentV2" (
    "id" TEXT NOT NULL,
    "enrollmentCode" TEXT NOT NULL,
    "enrollmentType" "EnrollmentTypeV2" NOT NULL,
    "gradeLevel" "GradeLevel" NOT NULL,
    "program" "Program" NOT NULL,
    "cottageType" "CottageType",
    "accreditation" "Accreditation" NOT NULL,
    "reportCard" TEXT,
    "discount" TEXT,
    "enrollmentStatus" "EnrollmentStatusV2" NOT NULL DEFAULT 'PENDING',
    "scholarship" TEXT,
    "signature" TEXT,
    "policyAgreement" BOOLEAN NOT NULL DEFAULT true,
    "formerRegistrar" TEXT,
    "formerRegistrarEmail" TEXT,
    "formerRegistrarNumber" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "workspaceId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "schoolYearId" TEXT NOT NULL,

    CONSTRAINT "enrollmentV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schoolFeesV2" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "transactionId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,

    CONSTRAINT "schoolFeesV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactionV2" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "paymentReference" TEXT,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL DEFAULT 'PHP',
    "fee" "Fees" NOT NULL DEFAULT 'ONLINE',
    "payment" DECIMAL(65,30),
    "balance" DECIMAL(65,30),
    "paymentProofLink" TEXT,
    "paymentType" "PaymentType" NOT NULL,
    "transactionStatus" "TransactionStatus" NOT NULL DEFAULT 'U',
    "paymentStatus" "TransactionStatus" NOT NULL DEFAULT 'U',
    "description" TEXT,
    "message" TEXT,
    "url" TEXT,
    "source" "TransactionSource" NOT NULL DEFAULT 'ENROLLMENT',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "transactionV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orderV2" (
    "orderId" TEXT NOT NULL,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "deliveryAddress" TEXT,
    "shippingType" "ShippingType",
    "contactNumber" TEXT,
    "paymentType" "PaymentType" NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT,

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
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "orderedById" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "orderItemV2_pkey" PRIMARY KEY ("orderItemId")
);

-- CreateTable
CREATE TABLE "orderFeeV2" (
    "orderFeeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "orderCode" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "signatureLink" TEXT,
    "orderFeeStatus" TEXT,
    "orderId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "orderFeeV2_pkey" PRIMARY KEY ("orderFeeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "studentV2_studentId_key" ON "studentV2"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "workspaceV2_workspaceId_key" ON "workspaceV2"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "workspaceV2_workspaceCode_key" ON "workspaceV2"("workspaceCode");

-- CreateIndex
CREATE UNIQUE INDEX "workspaceV2_studentId_key" ON "workspaceV2"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollmentV2_enrollmentCode_key" ON "enrollmentV2"("enrollmentCode");

-- CreateIndex
CREATE INDEX "enrollmentV2_workspaceId_idx" ON "enrollmentV2"("workspaceId");

-- CreateIndex
CREATE INDEX "enrollmentV2_studentId_idx" ON "enrollmentV2"("studentId");

-- CreateIndex
CREATE INDEX "enrollmentV2_schoolYearId_idx" ON "enrollmentV2"("schoolYearId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollmentV2_studentId_schoolYearId_key" ON "enrollmentV2"("studentId", "schoolYearId");

-- CreateIndex
CREATE UNIQUE INDEX "schoolFeesV2_transactionId_key" ON "schoolFeesV2"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "transactionV2_transactionId_key" ON "transactionV2"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "transactionV2_referenceNumber_key" ON "transactionV2"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "orderFeeV2_transactionId_key" ON "orderFeeV2"("transactionId");

-- RenameForeignKey (idempotent: prod may already be renamed, or FK may be missing entirely)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    INNER JOIN pg_class t ON c.conrelid = t.oid
    INNER JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public' AND t.relname = 'documentRequest'
      AND c.conname = 'documentRequest_requestorInformation_fk'
  ) THEN
    ALTER TABLE "documentRequest" RENAME CONSTRAINT "documentRequest_requestorInformation_fk" TO "documentRequest_requestCode_fkey";
  ELSIF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    INNER JOIN pg_class t ON c.conrelid = t.oid
    INNER JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public' AND t.relname = 'documentRequest'
      AND c.conname = 'documentRequest_requestCode_fkey'
  ) THEN
    ALTER TABLE "documentRequest" ADD CONSTRAINT "documentRequest_requestCode_fkey"
      FOREIGN KEY ("requestCode") REFERENCES "requestorInformation"("requestCode")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "studentInformation"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schoolYearV2" ADD CONSTRAINT "schoolYearV2_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studentV2" ADD CONSTRAINT "studentV2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaceV2" ADD CONSTRAINT "workspaceV2_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "studentV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaceV2" ADD CONSTRAINT "workspaceV2_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollmentV2" ADD CONSTRAINT "enrollmentV2_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollmentV2" ADD CONSTRAINT "enrollmentV2_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "studentV2"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollmentV2" ADD CONSTRAINT "enrollmentV2_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "schoolYearV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollmentV2" ADD CONSTRAINT "enrollmentV2_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaceV2"("workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schoolFeesV2" ADD CONSTRAINT "schoolFeesV2_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollmentV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schoolFeesV2" ADD CONSTRAINT "schoolFeesV2_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactionV2"("transactionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactionV2" ADD CONSTRAINT "transactionV2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderV2" ADD CONSTRAINT "orderV2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItemV2" ADD CONSTRAINT "orderItemV2_orderedById_fkey" FOREIGN KEY ("orderedById") REFERENCES "orderV2"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItemV2" ADD CONSTRAINT "orderItemV2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderFeeV2" ADD CONSTRAINT "orderFeeV2_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactionV2"("transactionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderFeeV2" ADD CONSTRAINT "orderFeeV2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderFeeV2" ADD CONSTRAINT "orderFeeV2_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orderV2"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;
