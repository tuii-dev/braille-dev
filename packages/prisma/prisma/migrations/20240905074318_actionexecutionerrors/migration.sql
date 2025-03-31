-- CreateTable
CREATE TABLE "ActionExecutionError" (
    "userMessage" TEXT NOT NULL,
    "actionExecutionId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ActionExecutionError_actionExecutionId_key" ON "ActionExecutionError"("actionExecutionId");

-- AddForeignKey
ALTER TABLE "ActionExecutionError" ADD CONSTRAINT "ActionExecutionError_actionExecutionId_fkey" FOREIGN KEY ("actionExecutionId") REFERENCES "ActionExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionExecutionError" ADD CONSTRAINT "ActionExecutionError_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
