/*
  Warnings:

  - The values [OBJECT] on the enum `FieldDataTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FieldDataTypeEnum_new" AS ENUM ('STRING', 'NUMBER', 'ENUM', 'DATE', 'DATETIME', 'ARRAY');
ALTER TABLE "Field" ALTER COLUMN "type" TYPE "FieldDataTypeEnum_new" USING ("type"::text::"FieldDataTypeEnum_new");
ALTER TYPE "FieldDataTypeEnum" RENAME TO "FieldDataTypeEnum_old";
ALTER TYPE "FieldDataTypeEnum_new" RENAME TO "FieldDataTypeEnum";
DROP TYPE "FieldDataTypeEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "Data" ADD COLUMN     "data" JSONB,
ADD COLUMN     "fields" JSONB;

-- AlterTable
ALTER TABLE "DataExtractionJob" ADD COLUMN     "dataStructureVersionId" TEXT;

-- AlterTable
ALTER TABLE "Field" ADD COLUMN     "dataStructureVersionId" TEXT;

-- CreateTable
CREATE TABLE "CurrentDataStructureVersion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dataStructureId" TEXT NOT NULL,
    "dataStructureVersionId" TEXT NOT NULL,

    CONSTRAINT "CurrentDataStructureVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataStructureVersion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataStructureId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "DataStructureVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrentDataStructureVersion_dataStructureId_key" ON "CurrentDataStructureVersion"("dataStructureId");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentDataStructureVersion_dataStructureVersionId_key" ON "CurrentDataStructureVersion"("dataStructureVersionId");

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_dataStructureVersionId_fkey" FOREIGN KEY ("dataStructureVersionId") REFERENCES "DataStructureVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentDataStructureVersion" ADD CONSTRAINT "CurrentDataStructureVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentDataStructureVersion" ADD CONSTRAINT "CurrentDataStructureVersion_dataStructureId_fkey" FOREIGN KEY ("dataStructureId") REFERENCES "DataStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentDataStructureVersion" ADD CONSTRAINT "CurrentDataStructureVersion_dataStructureVersionId_fkey" FOREIGN KEY ("dataStructureVersionId") REFERENCES "DataStructureVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataStructureVersion" ADD CONSTRAINT "DataStructureVersion_dataStructureId_fkey" FOREIGN KEY ("dataStructureId") REFERENCES "DataStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataStructureVersion" ADD CONSTRAINT "DataStructureVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_dataStructureVersionId_fkey" FOREIGN KEY ("dataStructureVersionId") REFERENCES "DataStructureVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
