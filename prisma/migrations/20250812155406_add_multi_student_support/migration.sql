-- Add missing columns to documents table (if they don't exist)
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "url" TEXT;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "studentId" TEXT;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS "idx_documents_studentId" ON "documents"("studentId");

-- DropForeignKey (only if it exists)
ALTER TABLE "documentRequest" DROP CONSTRAINT IF EXISTS "documentRequest_studentInformation_fk";

-- DropForeignKey (only if it exists)
ALTER TABLE "documents" DROP CONSTRAINT IF EXISTS "documents_studentId_fkey";

-- DropIndex (only if it exists)
DROP INDEX IF EXISTS "idx_documents_studentId";

-- DropIndex (only if it exists)
DROP INDEX IF EXISTS "studentInformation_requestCode_key";

-- AddForeignKey
ALTER TABLE "studentInformation" ADD CONSTRAINT "studentInformation_requestCode_fkey" FOREIGN KEY ("requestCode") REFERENCES "documentRequest"("requestCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "studentInformation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
