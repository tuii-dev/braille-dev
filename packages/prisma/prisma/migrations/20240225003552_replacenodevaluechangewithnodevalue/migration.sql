/*
  Warnings:

  - You are about to drop the `NodeValueChange` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NodeValueChange" DROP CONSTRAINT "NodeValueChange_createdById_fkey";

-- DropForeignKey
ALTER TABLE "NodeValueChange" DROP CONSTRAINT "NodeValueChange_nodeValueId_fkey";

-- DropForeignKey
ALTER TABLE "NodeValueChange" DROP CONSTRAINT "NodeValueChange_tenantId_fkey";

-- AlterTable
ALTER TABLE "NodeValue" ADD COLUMN     "changedNodeValueId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT;

-- DropTable
DROP TABLE "NodeValueChange";

-- AddForeignKey
ALTER TABLE "NodeValue" ADD CONSTRAINT "NodeValue_changedNodeValueId_fkey" FOREIGN KEY ("changedNodeValueId") REFERENCES "NodeValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeValue" ADD CONSTRAINT "NodeValue_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
