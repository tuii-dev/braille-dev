/*
  Warnings:

  - You are about to drop the column `changedNodeValueId` on the `NodeValue` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "NodeValue" DROP CONSTRAINT "NodeValue_changedNodeValueId_fkey";

-- AlterTable
ALTER TABLE "NodeValue" DROP COLUMN "changedNodeValueId";

-- CreateTable
CREATE TABLE "NodeValueChange" (
    "id" TEXT NOT NULL,
    "value" TEXT,
    "unit" TEXT,
    "nodeValueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "NodeValueChange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NodeValueChange" ADD CONSTRAINT "NodeValueChange_nodeValueId_fkey" FOREIGN KEY ("nodeValueId") REFERENCES "NodeValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeValueChange" ADD CONSTRAINT "NodeValueChange_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeValueChange" ADD CONSTRAINT "NodeValueChange_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
