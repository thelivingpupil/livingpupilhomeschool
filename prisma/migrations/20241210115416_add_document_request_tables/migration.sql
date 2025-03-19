-- CreateTable
CREATE TABLE "documentRequest" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,

    CONSTRAINT "documentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requestorInformation" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "requestorFullName" TEXT NOT NULL,
    "requestorEmail" TEXT NOT NULL,
    "relationshipToStudent" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "requestorAddress" TEXT NOT NULL,
    "requestorMobileNumber" TEXT NOT NULL,

    CONSTRAINT "requestorInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studentInformation" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "studentFullName" TEXT NOT NULL,
    "lrn" TEXT NOT NULL,
    "currentGradeLevel" TEXT NOT NULL,
    "currentSchool" TEXT NOT NULL,
    "gradeLevelsWithLp" TEXT NOT NULL,
    "lastSchoolYearWithLp" TEXT NOT NULL,

    CONSTRAINT "studentInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "docName" TEXT NOT NULL,
    "docFee" DECIMAL(65,30) NOT NULL,
    "requirement" TEXT NOT NULL,
    "processingTime" TEXT NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requestTransaction" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL DEFAULT 'PHP',
    "transactionStatus" "TransactionStatus" NOT NULL DEFAULT 'U',
    "paymentStatus" "TransactionStatus" NOT NULL DEFAULT 'U',
    "description" TEXT,
    "message" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "paymentReference" TEXT,
    "fee" "Fees" NOT NULL DEFAULT 'ONLINE',

    CONSTRAINT "requestTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documentRequest_requestCode_key" ON "documentRequest"("requestCode");

-- CreateIndex
CREATE UNIQUE INDEX "documentRequest_id_requestCode_key" ON "documentRequest"("id", "requestCode");

-- CreateIndex
CREATE UNIQUE INDEX "requestorInformation_requestCode_key" ON "requestorInformation"("requestCode");

-- CreateIndex
CREATE UNIQUE INDEX "studentInformation_requestCode_key" ON "studentInformation"("requestCode");

-- CreateIndex
CREATE UNIQUE INDEX "documents_requestCode_key" ON "documents"("requestCode");

-- CreateIndex
CREATE UNIQUE INDEX "requestTransaction_requestCode_key" ON "requestTransaction"("requestCode");

-- AddForeignKey
ALTER TABLE "documentRequest" ADD CONSTRAINT "documentRequest_requestorInformation_fk" FOREIGN KEY ("requestCode") REFERENCES "requestorInformation"("requestCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentRequest" ADD CONSTRAINT "documentRequest_studentInformation_fk" FOREIGN KEY ("requestCode") REFERENCES "studentInformation"("requestCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentRequest" ADD CONSTRAINT "documentRequest_documents_fk" FOREIGN KEY ("requestCode") REFERENCES "documents"("requestCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentRequest" ADD CONSTRAINT "documentRequest_transaction_fk" FOREIGN KEY ("requestCode") REFERENCES "requestTransaction"("requestCode") ON DELETE CASCADE ON UPDATE CASCADE;
