/*
  Warnings:

  - You are about to drop the column `nodeId` on the `NodeValue` table. All the data in the column will be lost.
  - You are about to drop the `Node` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ModelNodes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Tree` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `definitionId` to the `NodeValue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "NodeValue" DROP CONSTRAINT "NodeValue_nodeId_fkey";

-- DropForeignKey
ALTER TABLE "_ModelNodes" DROP CONSTRAINT "_ModelNodes_A_fkey";

-- DropForeignKey
ALTER TABLE "_ModelNodes" DROP CONSTRAINT "_ModelNodes_B_fkey";

-- DropForeignKey
ALTER TABLE "_Tree" DROP CONSTRAINT "_Tree_A_fkey";

-- DropForeignKey
ALTER TABLE "_Tree" DROP CONSTRAINT "_Tree_B_fkey";

-- AlterTable
ALTER TABLE "NodeValue" DROP COLUMN "nodeId",
ADD COLUMN     "definitionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Node";

-- DropTable
DROP TABLE "_ModelNodes";

-- DropTable
DROP TABLE "_Tree";

-- CreateTable
CREATE TABLE "Definition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "FieldDataTypeEnum" NOT NULL,
    "description" TEXT,
    "enum" TEXT[],
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeVersionContext" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "modelVersionId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "NodeVersionContext_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NodeValue" ADD CONSTRAINT "NodeValue_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "Definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Definition" ADD CONSTRAINT "Definition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeVersionContext" ADD CONSTRAINT "NodeVersionContext_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "Definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeVersionContext" ADD CONSTRAINT "NodeVersionContext_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeVersionContext" ADD CONSTRAINT "NodeVersionContext_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NodeVersionContext"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeVersionContext" ADD CONSTRAINT "NodeVersionContext_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
