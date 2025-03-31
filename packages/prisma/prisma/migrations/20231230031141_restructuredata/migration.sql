/*
  Warnings:

  - You are about to drop the column `fieldDataTypeId` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `structuredDataTemplateId` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the `FieldDataEnum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FieldDataType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StructureDataExtractionJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StructureDataValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StructuredData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StructuredDataTemplate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Field` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DataExtractionJobStatus" AS ENUM ('PENDING', 'RUNNING', 'FINISHED', 'FAILED');

-- AlterEnum
ALTER TYPE "FieldDataTypeEnum" ADD VALUE 'DATE';

-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_fieldDataTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_structuredDataTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "FieldDataEnum" DROP CONSTRAINT "FieldDataEnum_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "FieldDataType" DROP CONSTRAINT "FieldDataType_fieldDataEnumId_fkey";

-- DropForeignKey
ALTER TABLE "FieldDataType" DROP CONSTRAINT "FieldDataType_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "StructureDataExtractionJob" DROP CONSTRAINT "StructureDataExtractionJob_documentId_fkey";

-- DropForeignKey
ALTER TABLE "StructureDataExtractionJob" DROP CONSTRAINT "StructureDataExtractionJob_templateId_fkey";

-- DropForeignKey
ALTER TABLE "StructureDataValue" DROP CONSTRAINT "StructureDataValue_structuredDataId_fkey";

-- DropForeignKey
ALTER TABLE "StructureDataValue" DROP CONSTRAINT "StructureDataValue_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "StructuredData" DROP CONSTRAINT "StructuredData_documentId_fkey";

-- DropForeignKey
ALTER TABLE "StructuredData" DROP CONSTRAINT "StructuredData_structuredDataTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "StructuredData" DROP CONSTRAINT "StructuredData_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "StructuredDataTemplate" DROP CONSTRAINT "StructuredDataTemplate_tenantId_fkey";

-- AlterTable
ALTER TABLE "Field" DROP COLUMN "fieldDataTypeId",
DROP COLUMN "structuredDataTemplateId",
ADD COLUMN     "dataStructureId" TEXT,
ADD COLUMN     "type" "FieldDataTypeEnum" NOT NULL;

-- DropTable
DROP TABLE "FieldDataEnum";

-- DropTable
DROP TABLE "FieldDataType";

-- DropTable
DROP TABLE "StructureDataExtractionJob";

-- DropTable
DROP TABLE "StructureDataValue";

-- DropTable
DROP TABLE "StructuredData";

-- DropTable
DROP TABLE "StructuredDataTemplate";

-- DropEnum
DROP TYPE "PromptRole";

-- DropEnum
DROP TYPE "StructureDataExtractionJobStatus";

-- CreateTable
CREATE TABLE "FieldValue" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "structuredDataId" TEXT,
    "tenantId" TEXT NOT NULL,
    "dataId" TEXT,

    CONSTRAINT "FieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataStructure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "DataStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Data" (
    "id" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataExtractionJobRule" (
    "id" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "structureId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "DataExtractionJobRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataExtractionJob" (
    "id" TEXT NOT NULL,
    "status" "DataExtractionJobStatus" NOT NULL DEFAULT 'PENDING',
    "documentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "DataExtractionJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_dataStructureId_fkey" FOREIGN KEY ("dataStructureId") REFERENCES "DataStructure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldValue" ADD CONSTRAINT "FieldValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldValue" ADD CONSTRAINT "FieldValue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldValue" ADD CONSTRAINT "FieldValue_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "Data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataStructure" ADD CONSTRAINT "DataStructure_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "DataStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJobRule" ADD CONSTRAINT "DataExtractionJobRule_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "DataStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJobRule" ADD CONSTRAINT "DataExtractionJobRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
