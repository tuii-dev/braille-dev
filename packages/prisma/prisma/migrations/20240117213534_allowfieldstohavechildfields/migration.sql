/*
  Warnings:

  - The primary key for the `FieldsOnDataStructureVersions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `parentFieldValueId` to the `FieldValue` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `FieldsOnDataStructureVersions` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterEnum
ALTER TYPE "FieldDataTypeEnum" ADD VALUE 'OBJECT';

-- AlterTable
ALTER TABLE "FieldValue" ADD COLUMN     "parentFieldValueId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FieldsOnDataStructureVersions" DROP CONSTRAINT "FieldsOnDataStructureVersions_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "parentFieldId" TEXT,
ADD CONSTRAINT "FieldsOnDataStructureVersions_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "FieldValue" ADD CONSTRAINT "FieldValue_parentFieldValueId_fkey" FOREIGN KEY ("parentFieldValueId") REFERENCES "FieldValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldsOnDataStructureVersions" ADD CONSTRAINT "FieldsOnDataStructureVersions_parentFieldId_fkey" FOREIGN KEY ("parentFieldId") REFERENCES "FieldsOnDataStructureVersions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
