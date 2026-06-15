-- Align FK constraint names with Prisma defaults and add relation indexes (see schema @@index).
-- Idempotent: production may already have renamed constraints (skip RENAME if old name missing).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    INNER JOIN pg_class t ON c.conrelid = t.oid
    INNER JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public' AND t.relname = 'documentRequest' AND c.conname = 'documentRequest_transaction_fk'
  ) THEN
    ALTER TABLE "documentRequest" RENAME CONSTRAINT "documentRequest_transaction_fk" TO "documentRequest_transactionId_fkey";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    INNER JOIN pg_class t ON c.conrelid = t.oid
    INNER JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public' AND t.relname = 'documents' AND c.conname = 'documents_documentRequest_fk'
  ) THEN
    ALTER TABLE "documents" RENAME CONSTRAINT "documents_documentRequest_fk" TO "documents_requestCode_fkey";
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_documents_studentId" ON "documents"("studentId");

CREATE INDEX IF NOT EXISTS "idx_studentInformation_requestCode" ON "studentInformation"("requestCode");

ALTER TABLE "documentRequest" DROP CONSTRAINT IF EXISTS "documentRequest_studentInformation_fk";
