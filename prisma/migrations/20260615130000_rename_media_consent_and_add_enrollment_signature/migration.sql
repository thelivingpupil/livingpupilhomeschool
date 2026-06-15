-- AlterTable
ALTER TABLE "studentRecord" RENAME COLUMN "parentPartnershipAgreement" TO "mediaConsent";

-- AlterTable
ALTER TABLE "studentRecord" ADD COLUMN     "enrollmentAgreementSignature" TEXT,
ADD COLUMN     "enrollmentAgreementSignatureDate" TIMESTAMP(3);
