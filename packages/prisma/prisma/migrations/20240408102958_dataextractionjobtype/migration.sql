/*
  Warnings:

  - Added the required column `type` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DataExtractionJobType" AS ENUM ('MANUAL_MODEL', 'APP_ENTITY_ACTION');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('LIST', 'CREATE', 'READ', 'UPDATE', 'DELETE');

-- DropForeignKey
ALTER TABLE "Data" DROP CONSTRAINT "Data_modelVersionId_fkey";

-- DropForeignKey
ALTER TABLE "DataExtractionJob" DROP CONSTRAINT "DataExtractionJob_modelId_fkey";

-- DropForeignKey
ALTER TABLE "DataExtractionJob" DROP CONSTRAINT "DataExtractionJob_modelVersionId_fkey";

-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "type" "ActionType" NOT NULL;

-- AlterTable
ALTER TABLE "Data" ADD COLUMN     "appEntityModelVersionId" TEXT,
ALTER COLUMN "modelVersionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DataExtractionJob" ADD COLUMN     "appEntityModelVersionId" TEXT,
ADD COLUMN     "type" "DataExtractionJobType",
ALTER COLUMN "modelId" DROP NOT NULL,
ALTER COLUMN "modelVersionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Definition" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "label" DROP NOT NULL;

-- AlterTable
ALTER TABLE "NodeValue" ADD COLUMN     "json" JSONB;

-- CreateTable
CREATE TABLE "AppEntityModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppEntityModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppEntityModelVersion" (
    "id" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "isCurrentVersion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppEntityModelVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceAppEntityConnection" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "entityModelId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceAppEntityConnection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_appEntityModelVersionId_fkey" FOREIGN KEY ("appEntityModelVersionId") REFERENCES "AppEntityModelVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_appEntityModelVersionId_fkey" FOREIGN KEY ("appEntityModelVersionId") REFERENCES "AppEntityModelVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppEntityModel" ADD CONSTRAINT "AppEntityModel_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceAppEntityConnection" ADD CONSTRAINT "WorkspaceAppEntityConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceAppEntityConnection" ADD CONSTRAINT "WorkspaceAppEntityConnection_entityModelId_fkey" FOREIGN KEY ("entityModelId") REFERENCES "AppEntityModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceAppEntityConnection" ADD CONSTRAINT "WorkspaceAppEntityConnection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
