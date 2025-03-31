-- CreateEnum
CREATE TYPE "Trigger" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateTable
CREATE TABLE "ModelAction" (
    "id" TEXT NOT NULL,
    "trigger" "Trigger" NOT NULL,
    "modelId" TEXT NOT NULL,
    "actionVersionId" TEXT NOT NULL,
    "arguments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ModelAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModelAction" ADD CONSTRAINT "ModelAction_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelAction" ADD CONSTRAINT "ModelAction_actionVersionId_fkey" FOREIGN KEY ("actionVersionId") REFERENCES "ActionVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelAction" ADD CONSTRAINT "ModelAction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
