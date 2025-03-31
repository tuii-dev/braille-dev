/*
  Warnings:

  - You are about to drop the `Action` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ActionVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DataActionTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModelAction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_integrationId_fkey";

-- DropForeignKey
ALTER TABLE "ActionVersion" DROP CONSTRAINT "ActionVersion_actionId_fkey";

-- DropForeignKey
ALTER TABLE "DataActionTask" DROP CONSTRAINT "DataActionTask_actionVersionId_fkey";

-- DropForeignKey
ALTER TABLE "DataActionTask" DROP CONSTRAINT "DataActionTask_dataId_fkey";

-- DropForeignKey
ALTER TABLE "ModelAction" DROP CONSTRAINT "ModelAction_actionVersionId_fkey";

-- DropForeignKey
ALTER TABLE "ModelAction" DROP CONSTRAINT "ModelAction_modelId_fkey";

-- DropForeignKey
ALTER TABLE "ModelAction" DROP CONSTRAINT "ModelAction_tenantId_fkey";

-- DropTable
DROP TABLE "Action";

-- DropTable
DROP TABLE "ActionVersion";

-- DropTable
DROP TABLE "DataActionTask";

-- DropTable
DROP TABLE "ModelAction";

-- DropEnum
DROP TYPE "Trigger";

-- CreateTable
CREATE TABLE "ActionExectution" (
    "id" TEXT NOT NULL,
    "type" "ActionType" NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "dataExtractionJobId" TEXT NOT NULL,
    "executedById" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionExectution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActionExectution" ADD CONSTRAINT "ActionExectution_dataExtractionJobId_fkey" FOREIGN KEY ("dataExtractionJobId") REFERENCES "DataExtractionJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionExectution" ADD CONSTRAINT "ActionExectution_executedById_fkey" FOREIGN KEY ("executedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
