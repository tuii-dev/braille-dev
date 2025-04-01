-- AlterTable
ALTER TABLE "WorkflowExecution" ALTER COLUMN "tenantId" DROP NOT NULL,
ALTER COLUMN "templateId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkflowExecutionStep" ALTER COLUMN "templateId" DROP NOT NULL,
ALTER COLUMN "tenantId" DROP NOT NULL;

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

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTemplate_templateId_key" ON "WorkflowTemplate"("templateId");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_tenantId_idx" ON "WorkflowTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_workspaceId_idx" ON "WorkflowTemplate"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_appId_idx" ON "WorkflowTemplate"("appId");

-- AddForeignKey
ALTER TABLE "WorkflowStep" ADD CONSTRAINT "WorkflowStep_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkflowTemplate"("templateId") ON DELETE RESTRICT ON UPDATE CASCADE;
