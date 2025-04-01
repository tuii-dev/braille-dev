-- DropIndex
DROP INDEX "WorkflowExecutionStep_executionId_idx";

-- DropIndex
DROP INDEX "WorkflowExecutionStep_nodeId_key";

-- CreateIndex
CREATE INDEX "WorkflowExecutionStep_executionId_nodeId_idx" ON "WorkflowExecutionStep"("executionId", "nodeId");
