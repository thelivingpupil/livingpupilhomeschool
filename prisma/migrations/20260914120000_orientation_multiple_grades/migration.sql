-- CreateTable
CREATE TABLE "orientationVideoGrades" (
    "id" TEXT NOT NULL,
    "orientationVideoId" TEXT NOT NULL,
    "gradeLevel" "GradeLevel" NOT NULL,

    CONSTRAINT "orientationVideoGrades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orientationVideoGrades_orientationVideoId_gradeLevel_key" ON "orientationVideoGrades"("orientationVideoId", "gradeLevel");

-- AddForeignKey
ALTER TABLE "orientationVideoGrades" ADD CONSTRAINT "orientationVideoGrades_orientationVideoId_fkey" FOREIGN KEY ("orientationVideoId") REFERENCES "orientationVideos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Copy existing single grade levels onto the join table
INSERT INTO "orientationVideoGrades" ("id", "orientationVideoId", "gradeLevel")
SELECT gen_random_uuid()::text, "id", "gradeLevel" FROM "orientationVideos";

-- Drop old unique and column
DROP INDEX IF EXISTS "orientationVideos_gradeLevel_schoolYear_key";
ALTER TABLE "orientationVideos" DROP COLUMN "gradeLevel";

-- Allow multiple videos per parent/grade by tracking progress per video
DROP INDEX IF EXISTS "orientationProgress_userId_gradeLevel_schoolYear_key";
CREATE UNIQUE INDEX "orientationProgress_userId_orientationVideoId_key" ON "orientationProgress"("userId", "orientationVideoId");
