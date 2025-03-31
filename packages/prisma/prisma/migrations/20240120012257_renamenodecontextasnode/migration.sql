/*
  Warnings:

  - You are about to drop the `NodeVersionContext` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NodeVersionContext" DROP CONSTRAINT "NodeVersionContext_definitionId_fkey";

-- DropForeignKey
ALTER TABLE "NodeVersionContext" DROP CONSTRAINT "NodeVersionContext_modelVersionId_fkey";

-- DropForeignKey
ALTER TABLE "NodeVersionContext" DROP CONSTRAINT "NodeVersionContext_parentId_fkey";

-- DropForeignKey
ALTER TABLE "NodeVersionContext" DROP CONSTRAINT "NodeVersionContext_tenantId_fkey";

-- DropTable
DROP TABLE "NodeVersionContext";

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "modelVersionId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "Definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
