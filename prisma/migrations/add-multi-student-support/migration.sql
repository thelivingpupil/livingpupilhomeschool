-- Migration: Add multi-student support to document requests
-- This migration adds support for multiple students per document request

-- Step 1: Add studentId field to documents table
ALTER TABLE "documents" ADD COLUMN "studentId" TEXT;

-- Step 2: Create index for performance
CREATE INDEX "idx_documents_studentId" ON "documents"("studentId");

-- Step 3: Link existing documents to their respective students
UPDATE "documents" 
SET "studentId" = (
    SELECT "studentInformation"."id" 
    FROM "studentInformation" 
    WHERE "studentInformation"."requestCode" = "documents"."requestCode"
    LIMIT 1
)
WHERE "studentId" IS NULL;

-- Step 4: Remove unique constraint from studentInformation.requestCode
-- This allows multiple students per document request
ALTER TABLE "studentInformation" DROP CONSTRAINT IF EXISTS "studentInformation_requestCode_key";

-- Step 5: Add foreign key constraint for documents.studentId
ALTER TABLE "documents" ADD CONSTRAINT "documents_studentId_fkey" 
FOREIGN KEY ("studentId") REFERENCES "studentInformation"("id") ON DELETE CASCADE; 