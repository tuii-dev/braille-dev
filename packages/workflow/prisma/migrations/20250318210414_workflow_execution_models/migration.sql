/*
  Warnings:

  - You are about to drop the `AppScheduledTriggerRegistration` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AppScheduledTriggerRegistration" DROP CONSTRAINT "AppScheduledTriggerRegistration_appId_fkey";

-- DropForeignKey
ALTER TABLE "AppScheduledTriggerRegistration" DROP CONSTRAINT "AppScheduledTriggerRegistration_tenantId_fkey";

-- DropTable
DROP TABLE "AppScheduledTriggerRegistration";

-- CreateTable
CREATE TABLE "AppScheduledJobRegistration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cronSchedule" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "isDeleted" BOOLEAN NOT NULL,
    "isPaused" BOOLEAN NOT NULL,
    "created" TEXT,
    "updated" TEXT,
    "deleted" TEXT,

    CONSTRAINT "AppScheduledJobRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowExecution" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "name" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "callbackUrl" TEXT,
    "inputSchemaDependency" TEXT,
    "outputSchemaDependency" TEXT,
    "inputs" JSONB,
    "outputs" JSONB,
    "failedNodeIds" TEXT[],
    "isRoot" BOOLEAN NOT NULL,

    CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowExecutionStep" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "actionType" TEXT,
    "edges" TEXT[],
    "failActionType" TEXT,
    "inputSchemaDependency" TEXT,
    "outputSchemaDependency" TEXT,
    "inputs" JSONB,
    "outputs" JSONB,
    "workflowExecutionId" TEXT NOT NULL,

    CONSTRAINT "WorkflowExecutionStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowExecutionStepInputResolver" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "mapping" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,

    CONSTRAINT "WorkflowExecutionStepInputResolver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowExecutionRuntimeState" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "idField" TEXT NOT NULL,
    "validationSchema" JSONB NOT NULL,
    "validationTimestamp" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "workflowExecutionId" TEXT NOT NULL,

    CONSTRAINT "WorkflowExecutionRuntimeState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowExecutionOutputResolver" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mapping" TEXT NOT NULL,
    "workflowExecutionId" TEXT NOT NULL,

    CONSTRAINT "WorkflowExecutionOutputResolver_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowExecution_executionId_key" ON "WorkflowExecution"("executionId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowExecutionStep_nodeId_key" ON "WorkflowExecutionStep"("nodeId");

-- AddForeignKey
ALTER TABLE "AppScheduledJobRegistration" ADD CONSTRAINT "AppScheduledJobRegistration_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppScheduledJobRegistration" ADD CONSTRAINT "AppScheduledJobRegistration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecutionStep" ADD CONSTRAINT "WorkflowExecutionStep_workflowExecutionId_fkey" FOREIGN KEY ("workflowExecutionId") REFERENCES "WorkflowExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecutionStepInputResolver" ADD CONSTRAINT "WorkflowExecutionStepInputResolver_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "WorkflowExecutionStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecutionRuntimeState" ADD CONSTRAINT "WorkflowExecutionRuntimeState_workflowExecutionId_fkey" FOREIGN KEY ("workflowExecutionId") REFERENCES "WorkflowExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecutionOutputResolver" ADD CONSTRAINT "WorkflowExecutionOutputResolver_workflowExecutionId_fkey" FOREIGN KEY ("workflowExecutionId") REFERENCES "WorkflowExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
