/*
  Warnings:

  - Added the required column `tenantId` to the `WorkflowExecutionStep` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkflowExecution" ADD COLUMN     "failureMessage" TEXT;

-- AlterTable
ALTER TABLE "WorkflowExecutionStep" ADD COLUMN     "childWorkflowExecutionId" TEXT,
ADD COLUMN     "childWorkflowTemplateId" TEXT,
ADD COLUMN     "controlType" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "failureMessage" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "parentWorkflowExecutionId" TEXT,
ADD COLUMN     "parentWorkflowExecutionNodeId" TEXT,
ADD COLUMN     "sandboxedJsCode" TEXT,
ADD COLUMN     "stepFailureType" TEXT,
ADD COLUMN     "tenantId" TEXT NOT NULL;
