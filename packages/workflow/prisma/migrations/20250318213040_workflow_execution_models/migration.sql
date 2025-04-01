/*
  Warnings:

  - You are about to drop the `WorkflowExecutionOutputResolver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowExecutionRuntimeState` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowExecutionStepInputResolver` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkflowExecutionOutputResolver" DROP CONSTRAINT "WorkflowExecutionOutputResolver_workflowExecutionId_fkey";

-- DropForeignKey
ALTER TABLE "WorkflowExecutionRuntimeState" DROP CONSTRAINT "WorkflowExecutionRuntimeState_workflowExecutionId_fkey";

-- DropForeignKey
ALTER TABLE "WorkflowExecutionStepInputResolver" DROP CONSTRAINT "WorkflowExecutionStepInputResolver_stepId_fkey";

-- AlterTable
ALTER TABLE "WorkflowExecution" ADD COLUMN     "appId" TEXT,
ADD COLUMN     "outputResolvers" JSONB,
ADD COLUMN     "parentWorkflowExecutionId" TEXT,
ADD COLUMN     "parentWorkflowExecutionNodeId" TEXT,
ADD COLUMN     "runtimeState" JSONB,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkflowExecutionStep" ADD COLUMN     "inputResolvers" JSONB;

-- DropTable
DROP TABLE "WorkflowExecutionOutputResolver";

-- DropTable
DROP TABLE "WorkflowExecutionRuntimeState";

-- DropTable
DROP TABLE "WorkflowExecutionStepInputResolver";
