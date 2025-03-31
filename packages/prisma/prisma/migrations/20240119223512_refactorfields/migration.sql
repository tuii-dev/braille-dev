/*
  Warnings:

  - You are about to drop the column `structureVersionId` on the `Data` table. All the data in the column will be lost.
  - You are about to drop the `DataStructure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DataStructureVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Field` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FieldValue` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `modelVersionId` to the `Data` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Data" DROP CONSTRAINT "Data_structureVersionId_fkey";

-- DropForeignKey
ALTER TABLE "DataExtractionJob" DROP CONSTRAINT "DataExtractionJob_dataStructureVersionId_fkey";

-- DropForeignKey
ALTER TABLE "DataExtractionJob" DROP CONSTRAINT "DataExtractionJob_structureId_fkey";

-- DropForeignKey
ALTER TABLE "DataStructure" DROP CONSTRAINT "DataStructure_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "DataStructureVersion" DROP CONSTRAINT "DataStructureVersion_dataStructureId_fkey";

-- DropForeignKey
ALTER TABLE "DataStructureVersion" DROP CONSTRAINT "DataStructureVersion_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "DataStructureVersion" DROP CONSTRAINT "DataStructureVersion_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_parentFieldId_fkey";

-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "FieldValue" DROP CONSTRAINT "FieldValue_dataId_fkey";

-- DropForeignKey
ALTER TABLE "FieldValue" DROP CONSTRAINT "FieldValue_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "FieldValue" DROP CONSTRAINT "FieldValue_parentFieldValueId_fkey";

-- DropForeignKey
ALTER TABLE "FieldValue" DROP CONSTRAINT "FieldValue_tenantId_fkey";

-- AlterTable
ALTER TABLE "Data" DROP COLUMN "structureVersionId",
ADD COLUMN     "modelVersionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "DataStructure";

-- DropTable
DROP TABLE "DataStructureVersion";

-- DropTable
DROP TABLE "Field";

-- DropTable
DROP TABLE "FieldValue";

-- CreateTable
CREATE TABLE "NodeValue" (
    "id" TEXT NOT NULL,
    "value" TEXT,
    "nodeId" TEXT NOT NULL,
    "parentNodeValueId" TEXT,
    "dataId" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "NodeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelVersion" (
    "id" TEXT NOT NULL,
    "versionNodeId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "isCurrentVersion" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ModelVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "FieldDataTypeEnum" NOT NULL,
    "description" TEXT,
    "enum" TEXT[],
    "parentFieldId" TEXT,
    "tenantId" TEXT NOT NULL,
    "modelVersionId" TEXT,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ModelNodes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ModelNodes_AB_unique" ON "_ModelNodes"("A", "B");

-- CreateIndex
CREATE INDEX "_ModelNodes_B_index" ON "_ModelNodes"("B");

-- AddForeignKey
ALTER TABLE "NodeValue" ADD CONSTRAINT "NodeValue_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeValue" ADD CONSTRAINT "NodeValue_parentNodeValueId_fkey" FOREIGN KEY ("parentNodeValueId") REFERENCES "NodeValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeValue" ADD CONSTRAINT "NodeValue_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "Data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeValue" ADD CONSTRAINT "NodeValue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVersion" ADD CONSTRAINT "ModelVersion_versionNodeId_fkey" FOREIGN KEY ("versionNodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVersion" ADD CONSTRAINT "ModelVersion_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVersion" ADD CONSTRAINT "ModelVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_parentFieldId_fkey" FOREIGN KEY ("parentFieldId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_dataStructureVersionId_fkey" FOREIGN KEY ("dataStructureVersionId") REFERENCES "ModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModelNodes" ADD CONSTRAINT "_ModelNodes_A_fkey" FOREIGN KEY ("A") REFERENCES "ModelVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModelNodes" ADD CONSTRAINT "_ModelNodes_B_fkey" FOREIGN KEY ("B") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
