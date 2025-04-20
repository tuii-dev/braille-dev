-- AlterTable
ALTER TABLE "_TenantToUser" ADD CONSTRAINT "_TenantToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_TenantToUser_AB_unique";

-- CreateTable
CREATE TABLE "WorkflowTemplate" (
    "templateId" TEXT NOT NULL,
    "tenantId" TEXT,
    "workspaceId" TEXT,
    "appId" TEXT,
    "name" TEXT,
    "description" TEXT,
    "inputSchemaDependency" TEXT,
    "outputSchemaDependency" TEXT,
    "outputResolvers" JSONB,
    "created" TIMESTAMP(3),
    "updated" TIMESTAMP(3),
    "deleted" BOOLEAN,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkflowTemplate_pkey" PRIMARY KEY ("templateId")
);

-- CreateTable
CREATE TABLE "WorkflowStep" (
    "templateId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT,
    "description" TEXT,
    "actionType" TEXT,
    "controlType" TEXT,
    "sandboxedJsCode" TEXT,
    "edges" TEXT[],
    "failActionType" TEXT,
    "inputResolvers" JSONB,
    "inputSchemaDependency" TEXT,
    "outputSchemaDependency" TEXT,
    "stepFailureType" TEXT,

    CONSTRAINT "WorkflowStep_pkey" PRIMARY KEY ("templateId","nodeId")
);

-- CreateTable
CREATE TABLE "WorkflowExecution" (
    "executionId" TEXT NOT NULL,
    "tenantId" TEXT,
    "templateId" TEXT,
    "workspaceId" TEXT,
    "appId" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "name" TEXT,
    "description" TEXT,
    "status" TEXT,
    "parentWorkflowExecutionId" TEXT,
    "parentWorkflowExecutionNodeId" TEXT,
    "callbackUrl" TEXT,
    "inputSchemaDependency" TEXT,
    "outputSchemaDependency" TEXT,
    "inputs" JSONB,
    "outputs" JSONB,
    "runtimeState" JSONB,
    "outputResolvers" JSONB,
    "failedNodeIds" TEXT[],
    "failureMessage" TEXT,
    "isRoot" BOOLEAN NOT NULL,
    "operationsConsumed" INTEGER,

    CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("executionId")
);

-- CreateTable
CREATE TABLE "WorkflowExecutionStep" (
    "executionId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tenantId" TEXT,
    "templateId" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "name" TEXT,
    "description" TEXT,
    "status" TEXT,
    "actionType" TEXT,
    "childWorkflowTemplateId" TEXT,
    "childWorkflowExecutionId" TEXT,
    "parentWorkflowExecutionId" TEXT,
    "parentWorkflowExecutionNodeId" TEXT,
    "controlType" TEXT,
    "sandboxedJsCode" TEXT,
    "edges" TEXT[],
    "failActionType" TEXT,
    "inputResolvers" JSONB,
    "inputSchemaDependency" TEXT,
    "outputSchemaDependency" TEXT,
    "inputs" JSONB,
    "outputs" JSONB,
    "stepFailureType" TEXT,
    "failureMessage" TEXT,
    "operationsConsumed" INTEGER,

    CONSTRAINT "WorkflowExecutionStep_pkey" PRIMARY KEY ("executionId","nodeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTemplate_templateId_key" ON "WorkflowTemplate"("templateId");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_tenantId_idx" ON "WorkflowTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_workspaceId_idx" ON "WorkflowTemplate"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_appId_idx" ON "WorkflowTemplate"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowExecution_executionId_key" ON "WorkflowExecution"("executionId");

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

-- AddForeignKey
ALTER TABLE "WorkflowStep" ADD CONSTRAINT "WorkflowStep_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkflowTemplate"("templateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecutionStep" ADD CONSTRAINT "WorkflowExecutionStep_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "WorkflowExecution"("executionId") ON DELETE RESTRICT ON UPDATE CASCADE;
