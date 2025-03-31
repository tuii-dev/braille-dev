/*
  Warnings:

  - You are about to drop the `FieldsOnDataStructureVersions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fieldId` to the `DataStructureVersion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FieldsOnDataStructureVersions" DROP CONSTRAINT "FieldsOnDataStructureVersions_dataStructureVersionId_fkey";

-- DropForeignKey
ALTER TABLE "FieldsOnDataStructureVersions" DROP CONSTRAINT "FieldsOnDataStructureVersions_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "FieldsOnDataStructureVersions" DROP CONSTRAINT "FieldsOnDataStructureVersions_parentFieldId_fkey";

-- DropForeignKey
ALTER TABLE "FieldsOnDataStructureVersions" DROP CONSTRAINT "FieldsOnDataStructureVersions_tenantId_fkey";

-- AlterTable
ALTER TABLE "DataStructureVersion" ADD COLUMN     "fieldId" TEXT NOT NULL;

-- DropTable
DROP TABLE "FieldsOnDataStructureVersions";

-- AddForeignKey
ALTER TABLE "DataStructureVersion" ADD CONSTRAINT "DataStructureVersion_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
