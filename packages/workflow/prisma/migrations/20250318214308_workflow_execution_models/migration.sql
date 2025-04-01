/*
  Warnings:

  - You are about to drop the column `workflowExecutionId` on the `WorkflowExecutionStep` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkflowExecutionStep" DROP CONSTRAINT "WorkflowExecutionStep_workflowExecutionId_fkey";

-- AlterTable
ALTER TABLE "WorkflowExecution" ADD COLUMN     "operationsConsumed" INTEGER;

-- AlterTable
ALTER TABLE "WorkflowExecutionStep" DROP COLUMN "workflowExecutionId",
ADD COLUMN     "operationsConsumed" INTEGER,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "WorkflowExecution_tenantId_idx" ON "WorkflowExecution"("tenantId");

-- CreateIndex
CREATE INDEX "WorkflowExecution_templateId_idx" ON "WorkflowExecution"("templateId");

-- CreateIndex
CREATE INDEX "WorkflowExecution_workspaceId_idx" ON "WorkflowExecution"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkflowExecution_appId_idx" ON "WorkflowExecution"("appId");

-- CreateIndex
CREATE INDEX "WorkflowExecutionStep_templateId_idx" ON "WorkflowExecutionStep"("templateId");

-- CreateIndex
CREATE INDEX "WorkflowExecutionStep_executionId_idx" ON "WorkflowExecutionStep"("executionId");

-- AddForeignKey
ALTER TABLE "WorkflowExecutionStep" ADD CONSTRAINT "WorkflowExecutionStep_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "WorkflowExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
