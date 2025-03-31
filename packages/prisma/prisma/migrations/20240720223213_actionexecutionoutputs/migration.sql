-- CreateTable
CREATE TABLE "ActionOuputs" (
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "actionExectutionId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ActionOuputs_name_actionExectutionId_key" ON "ActionOuputs"("name", "actionExectutionId");

-- AddForeignKey
ALTER TABLE "ActionOuputs" ADD CONSTRAINT "ActionOuputs_actionExectutionId_fkey" FOREIGN KEY ("actionExectutionId") REFERENCES "ActionExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionOuputs" ADD CONSTRAINT "ActionOuputs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
