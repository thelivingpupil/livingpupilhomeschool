-- CreateTable
CREATE TABLE "parentTraining" (
    "id" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "workspaceCode" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "parentTraining_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "parentTraining" ADD CONSTRAINT "parentTraining_workspaceCode_fkey" FOREIGN KEY ("workspaceCode") REFERENCES "workspaces"("workspaceCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parentTraining" ADD CONSTRAINT "parentTraining_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "guardianInformation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
