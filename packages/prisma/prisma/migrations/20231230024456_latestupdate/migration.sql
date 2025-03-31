/*
  Warnings:

  - Added the required column `tenantId` to the `StructureDataValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentId` to the `StructuredData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `StructuredDataTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StructureDataExtractionJobStatus" AS ENUM ('PENDING', 'RUNNING', 'FINISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('USER', 'SYSTEM');

-- AlterTable
ALTER TABLE "StructureDataValue" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StructuredData" ADD COLUMN     "documentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StructuredDataTemplate" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "StructureDataExtractionJob" (
    "id" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "status" "StructureDataExtractionJobStatus" NOT NULL DEFAULT 'PENDING',
    "documentId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "StructureDataExtractionJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StructureDataValue" ADD CONSTRAINT "StructureDataValue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructuredData" ADD CONSTRAINT "StructuredData_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureDataExtractionJob" ADD CONSTRAINT "StructureDataExtractionJob_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureDataExtractionJob" ADD CONSTRAINT "StructureDataExtractionJob_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StructuredDataTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
