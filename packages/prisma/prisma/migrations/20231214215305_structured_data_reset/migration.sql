-- CreateEnum
CREATE TYPE "MimeType" AS ENUM ('PNG', 'PDF', 'JPEG');

-- CreateEnum
CREATE TYPE "PromptRole" AS ENUM ('SYSTEM', 'USER');

-- CreateEnum
CREATE TYPE "FieldDataTypeEnum" AS ENUM ('STRING', 'OBJECT', 'NUMBER', 'ENUM', 'DATETIME');

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "MimeType" NOT NULL,
    "documentId" TEXT,
    "idx" INTEGER,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailedDescription" (
    "id" TEXT NOT NULL,
    "fileId" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "DetailedDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldDataEnum" (
    "id" TEXT NOT NULL,
    "enum" TEXT[],

    CONSTRAINT "FieldDataEnum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldDataType" (
    "id" TEXT NOT NULL,
    "type" "FieldDataTypeEnum" NOT NULL,
    "description" TEXT NOT NULL,
    "fieldDataEnumId" TEXT,

    CONSTRAINT "FieldDataType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Field" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fieldDataTypeId" TEXT NOT NULL,
    "structuredDataTemplateId" TEXT,

    CONSTRAINT "Field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructureDataValue" (
    "id" TEXT NOT NULL,
    "structuredDataId" TEXT,

    CONSTRAINT "StructureDataValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructuredDataTemplate" (
    "id" TEXT NOT NULL,

    CONSTRAINT "StructuredDataTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructuredData" (
    "id" TEXT NOT NULL,
    "structuredDataTemplateId" TEXT NOT NULL,

    CONSTRAINT "StructuredData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_key_key" ON "File"("key");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailedDescription" ADD CONSTRAINT "DetailedDescription_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldDataType" ADD CONSTRAINT "FieldDataType_fieldDataEnumId_fkey" FOREIGN KEY ("fieldDataEnumId") REFERENCES "FieldDataEnum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_fieldDataTypeId_fkey" FOREIGN KEY ("fieldDataTypeId") REFERENCES "FieldDataType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_structuredDataTemplateId_fkey" FOREIGN KEY ("structuredDataTemplateId") REFERENCES "StructuredDataTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureDataValue" ADD CONSTRAINT "StructureDataValue_structuredDataId_fkey" FOREIGN KEY ("structuredDataId") REFERENCES "StructuredData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructuredData" ADD CONSTRAINT "StructuredData_structuredDataTemplateId_fkey" FOREIGN KEY ("structuredDataTemplateId") REFERENCES "StructuredDataTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
