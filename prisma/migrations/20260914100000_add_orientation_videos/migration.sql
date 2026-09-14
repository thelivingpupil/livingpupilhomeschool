-- CreateTable
CREATE TABLE "orientationVideos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "gradeLevel" "GradeLevel" NOT NULL,
    "schoolYear" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "videoPath" TEXT,
    "requiredWatchSeconds" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orientationVideos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orientationProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orientationVideoId" TEXT NOT NULL,
    "gradeLevel" "GradeLevel" NOT NULL,
    "schoolYear" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orientationProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orientationVideos_gradeLevel_schoolYear_key" ON "orientationVideos"("gradeLevel", "schoolYear");

-- CreateIndex
CREATE UNIQUE INDEX "orientationProgress_userId_gradeLevel_schoolYear_key" ON "orientationProgress"("userId", "gradeLevel", "schoolYear");

-- AddForeignKey
ALTER TABLE "orientationProgress" ADD CONSTRAINT "orientationProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientationProgress" ADD CONSTRAINT "orientationProgress_orientationVideoId_fkey" FOREIGN KEY ("orientationVideoId") REFERENCES "orientationVideos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
