/*
  Warnings:

  - You are about to drop the column `data` on the `Data` table. All the data in the column will be lost.
  - You are about to drop the column `documentId` on the `Data` table. All the data in the column will be lost.
  - You are about to drop the column `fields` on the `Data` table. All the data in the column will be lost.
  - You are about to drop the column `structureId` on the `Data` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `DataStructureVersion` table. All the data in the column will be lost.
  - You are about to drop the column `dataStructureId` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `dataStructureVersionId` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the `CurrentDataStructureVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DataExtractionJobRule` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[currentVersionId]` on the table `DataStructure` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `structureVersionId` to the `Data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentVersionId` to the `DataStructure` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CurrentDataStructureVersion" DROP CONSTRAINT "CurrentDataStructureVersion_dataStructureId_fkey";

-- DropForeignKey
ALTER TABLE "CurrentDataStructureVersion" DROP CONSTRAINT "CurrentDataStructureVersion_dataStructureVersionId_fkey";

-- DropForeignKey
ALTER TABLE "CurrentDataStructureVersion" DROP CONSTRAINT "CurrentDataStructureVersion_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Data" DROP CONSTRAINT "Data_documentId_fkey";

-- DropForeignKey
ALTER TABLE "Data" DROP CONSTRAINT "Data_structureId_fkey";

-- DropForeignKey
ALTER TABLE "DataExtractionJobRule" DROP CONSTRAINT "DataExtractionJobRule_dataId_fkey";

-- DropForeignKey
ALTER TABLE "DataExtractionJobRule" DROP CONSTRAINT "DataExtractionJobRule_structureId_fkey";

-- DropForeignKey
ALTER TABLE "DataExtractionJobRule" DROP CONSTRAINT "DataExtractionJobRule_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_dataStructureId_fkey";

-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_dataStructureVersionId_fkey";

-- AlterTable
ALTER TABLE "Data" DROP COLUMN "data",
DROP COLUMN "documentId",
DROP COLUMN "fields",
DROP COLUMN "structureId",
ADD COLUMN     "structureVersionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DataStructure" ADD COLUMN     "currentVersionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DataStructureVersion" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "Field" DROP COLUMN "dataStructureId",
DROP COLUMN "dataStructureVersionId";

-- DropTable
DROP TABLE "CurrentDataStructureVersion";

-- DropTable
DROP TABLE "DataExtractionJobRule";

-- CreateTable
CREATE TABLE "FieldsOnDataStructureVersions" (
    "fieldId" TEXT NOT NULL,
    "dataStructureVersionId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "FieldsOnDataStructureVersions_pkey" PRIMARY KEY ("fieldId","dataStructureVersionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataStructure_currentVersionId_key" ON "DataStructure"("currentVersionId");

-- AddForeignKey
ALTER TABLE "DataStructure" ADD CONSTRAINT "DataStructure_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "DataStructureVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldsOnDataStructureVersions" ADD CONSTRAINT "FieldsOnDataStructureVersions_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldsOnDataStructureVersions" ADD CONSTRAINT "FieldsOnDataStructureVersions_dataStructureVersionId_fkey" FOREIGN KEY ("dataStructureVersionId") REFERENCES "DataStructureVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldsOnDataStructureVersions" ADD CONSTRAINT "FieldsOnDataStructureVersions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_structureVersionId_fkey" FOREIGN KEY ("structureVersionId") REFERENCES "DataStructureVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
