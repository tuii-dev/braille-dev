/*
  Warnings:

  - You are about to drop the `ActionExectution` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActionExectution" DROP CONSTRAINT "ActionExectution_dataExtractionJobId_fkey";

-- DropForeignKey
ALTER TABLE "ActionExectution" DROP CONSTRAINT "ActionExectution_executedById_fkey";

-- DropForeignKey
ALTER TABLE "ActionExectution" DROP CONSTRAINT "ActionExectution_tenantId_fkey";

-- DropTable
DROP TABLE "ActionExectution";

-- CreateTable
CREATE TABLE "ActionExecution" (
    "id" TEXT NOT NULL,
    "type" "ActionType" NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "dataExtractionJobId" TEXT NOT NULL,
    "executedById" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ActionExecution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActionExecution" ADD CONSTRAINT "ActionExecution_dataExtractionJobId_fkey" FOREIGN KEY ("dataExtractionJobId") REFERENCES "DataExtractionJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionExecution" ADD CONSTRAINT "ActionExecution_executedById_fkey" FOREIGN KEY ("executedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionExecution" ADD CONSTRAINT "ActionExecution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
