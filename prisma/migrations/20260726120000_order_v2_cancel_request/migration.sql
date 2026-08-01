-- AlterTable
ALTER TABLE "orderV2" ADD COLUMN IF NOT EXISTS "cancelRequestedAt" TIMESTAMP(3);
ALTER TABLE "orderV2" ADD COLUMN IF NOT EXISTS "cancelReason" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orderV2_cancelRequestedAt_idx" ON "orderV2"("cancelRequestedAt");
