/*
  Warnings:

  - You are about to drop the column `appEntityModelVersionId` on the `Data` table. All the data in the column will be lost.
  - You are about to drop the column `dataExtractionJobId` on the `Data` table. All the data in the column will be lost.
  - You are about to drop the column `appEntityModelVersionId` on the `DataExtractionJob` table. All the data in the column will be lost.
  - You are about to drop the column `modelId` on the `DataExtractionJob` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `DataExtractionJob` table. All the data in the column will be lost.
  - You are about to drop the column `entityModelId` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `isCurrentVersion` on the `ModelVersion` table. All the data in the column will be lost.
  - You are about to drop the `AppEntityModel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AppEntityModelVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConnectionSetting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Definition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Integration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntegrationIngestionConfiguration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntegrationOAuthClientSecret` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntegrationOAuthTokenSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntegrationPublisher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntegrationVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Node` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NodeValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NodeValueChange` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkspaceAppEntityConnection` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `modelVersionId` on table `Data` required. This step will fail if there are existing NULL values in that column.
  - Made the column `json` on table `Data` required. This step will fail if there are existing NULL values in that column.
  - Made the column `modelVersionId` on table `DataExtractionJob` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `appConnectionId` to the `Entity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appVersionModelVersionAppVersionId` to the `Entity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appVersionModelVersionModelVersionId` to the `Entity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Model` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schemaId` to the `ModelVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ModelVersion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppConnectionSettingType" AS ENUM ('SETTING', 'COMPUTED');

-- DropForeignKey
ALTER TABLE "AppEntityModel" DROP CONSTRAINT "AppEntityModel_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "AppEntityModelVersion" DROP CONSTRAINT "AppEntityModelVersion_appVersionId_fkey";

-- DropForeignKey
ALTER TABLE "AppEntityModelVersion" DROP CONSTRAINT "AppEntityModelVersion_modelId_fkey";

-- DropForeignKey
ALTER TABLE "ConnectionSetting" DROP CONSTRAINT "ConnectionSetting_integrationConfigurationId_fkey";

-- DropForeignKey
ALTER TABLE "ConnectionSetting" DROP CONSTRAINT "ConnectionSetting_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Data" DROP CONSTRAINT "Data_appEntityModelVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Data" DROP CONSTRAINT "Data_dataExtractionJobId_fkey";

-- DropForeignKey
ALTER TABLE "Data" DROP CONSTRAINT "Data_modelVersionId_fkey";

-- DropForeignKey
ALTER TABLE "DataExtractionJob" DROP CONSTRAINT "DataExtractionJob_appEntityModelVersionId_fkey";

-- DropForeignKey
ALTER TABLE "DataExtractionJob" DROP CONSTRAINT "DataExtractionJob_modelId_fkey";

-- DropForeignKey
ALTER TABLE "DataExtractionJob" DROP CONSTRAINT "DataExtractionJob_modelVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Definition" DROP CONSTRAINT "Definition_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Entity" DROP CONSTRAINT "Entity_entityModelId_fkey";

-- DropForeignKey
ALTER TABLE "Integration" DROP CONSTRAINT "Integration_integrationPublisherId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationIngestionConfiguration" DROP CONSTRAINT "IntegrationIngestionConfiguration_integrationId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationIngestionConfiguration" DROP CONSTRAINT "IntegrationIngestionConfiguration_oauthTokensetId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationIngestionConfiguration" DROP CONSTRAINT "IntegrationIngestionConfiguration_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationOAuthClientSecret" DROP CONSTRAINT "IntegrationOAuthClientSecret_integrationId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationOAuthTokenSet" DROP CONSTRAINT "IntegrationOAuthTokenSet_createdById_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationOAuthTokenSet" DROP CONSTRAINT "IntegrationOAuthTokenSet_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationVersion" DROP CONSTRAINT "IntegrationVersion_integrationId_fkey";

-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "ModelVersion" DROP CONSTRAINT "ModelVersion_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_definitionId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_modelVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_nextId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_prevId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "NodeValue" DROP CONSTRAINT "NodeValue_dataId_fkey";

-- DropForeignKey
ALTER TABLE "NodeValue" DROP CONSTRAINT "NodeValue_definitionId_fkey";

-- DropForeignKey
ALTER TABLE "NodeValue" DROP CONSTRAINT "NodeValue_nodeId_fkey";

-- DropForeignKey
ALTER TABLE "NodeValue" DROP CONSTRAINT "NodeValue_parentNodeValueId_fkey";

-- DropForeignKey
ALTER TABLE "NodeValue" DROP CONSTRAINT "NodeValue_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "NodeValueChange" DROP CONSTRAINT "NodeValueChange_createdById_fkey";

-- DropForeignKey
ALTER TABLE "NodeValueChange" DROP CONSTRAINT "NodeValueChange_nodeId_fkey";

-- DropForeignKey
ALTER TABLE "NodeValueChange" DROP CONSTRAINT "NodeValueChange_nodeValueId_fkey";

-- DropForeignKey
ALTER TABLE "NodeValueChange" DROP CONSTRAINT "NodeValueChange_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceAppEntityConnection" DROP CONSTRAINT "WorkspaceAppEntityConnection_entityModelId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceAppEntityConnection" DROP CONSTRAINT "WorkspaceAppEntityConnection_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceAppEntityConnection" DROP CONSTRAINT "WorkspaceAppEntityConnection_workspaceId_fkey";

-- DropIndex
DROP INDEX "Data_dataExtractionJobId_key";

-- AlterTable
ALTER TABLE "Data" DROP COLUMN "appEntityModelVersionId",
DROP COLUMN "dataExtractionJobId",
ALTER COLUMN "modelVersionId" SET NOT NULL,
ALTER COLUMN "json" SET NOT NULL;

-- AlterTable
ALTER TABLE "DataExtractionJob" DROP COLUMN "appEntityModelVersionId",
DROP COLUMN "modelId",
DROP COLUMN "type",
ADD COLUMN     "dataId" TEXT,
ALTER COLUMN "modelVersionId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Entity" DROP COLUMN "entityModelId",
ADD COLUMN     "appConnectionId" TEXT NOT NULL,
ADD COLUMN     "appVersionModelVersionAppVersionId" TEXT NOT NULL,
ADD COLUMN     "appVersionModelVersionModelVersionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Model" DROP COLUMN "name",
ADD COLUMN     "appId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "tenantId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ModelVersion" DROP COLUMN "isCurrentVersion",
ADD COLUMN     "appVersionId" TEXT,
ADD COLUMN     "schemaId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "tenantId" DROP NOT NULL;

-- DropTable
DROP TABLE "AppEntityModel";

-- DropTable
DROP TABLE "AppEntityModelVersion";

-- DropTable
DROP TABLE "ConnectionSetting";

-- DropTable
DROP TABLE "Definition";

-- DropTable
DROP TABLE "Integration";

-- DropTable
DROP TABLE "IntegrationIngestionConfiguration";

-- DropTable
DROP TABLE "IntegrationOAuthClientSecret";

-- DropTable
DROP TABLE "IntegrationOAuthTokenSet";

-- DropTable
DROP TABLE "IntegrationPublisher";

-- DropTable
DROP TABLE "IntegrationVersion";

-- DropTable
DROP TABLE "Node";

-- DropTable
DROP TABLE "NodeValue";

-- DropTable
DROP TABLE "NodeValueChange";

-- DropTable
DROP TABLE "WorkspaceAppEntityConnection";

-- DropEnum
DROP TYPE "ConnectionSettingType";

-- DropEnum
DROP TYPE "DataExtractionJobType";

-- DropEnum
DROP TYPE "PublisherType";

-- CreateTable
CREATE TABLE "AppPublisher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppPublisher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "appPublisherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppVersion" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppVersionModelVersion" (
    "appVersionId" TEXT NOT NULL,
    "modelVersionId" TEXT NOT NULL,

    CONSTRAINT "AppVersionModelVersion_pkey" PRIMARY KEY ("appVersionId","modelVersionId")
);

-- CreateTable
CREATE TABLE "AppConnection" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "oauthTokensetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "AppConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppConnectionSetting" (
    "id" TEXT NOT NULL,
    "type" "AppConnectionSettingType" DEFAULT 'SETTING',
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "AppConnectionSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppOAuthTokenSet" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" INTEGER NOT NULL,
    "scope" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "AppOAuthTokenSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppOAuthClientSecret" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppOAuthClientSecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schema" (
    "id" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "Schema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceModelConnection" (
    "workspaceId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceModelConnection_pkey" PRIMARY KEY ("workspaceId","modelId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppVersionModelVersion_modelVersionId_key" ON "AppVersionModelVersion"("modelVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "AppOAuthClientSecret_appId_key" ON "AppOAuthClientSecret"("appId");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVersion" ADD CONSTRAINT "ModelVersion_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "Schema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVersion" ADD CONSTRAINT "ModelVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVersion" ADD CONSTRAINT "ModelVersion_appVersionId_fkey" FOREIGN KEY ("appVersionId") REFERENCES "AppVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "Data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "App" ADD CONSTRAINT "App_appPublisherId_fkey" FOREIGN KEY ("appPublisherId") REFERENCES "AppPublisher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppVersion" ADD CONSTRAINT "AppVersion_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppVersionModelVersion" ADD CONSTRAINT "AppVersionModelVersion_appVersionId_fkey" FOREIGN KEY ("appVersionId") REFERENCES "AppVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppVersionModelVersion" ADD CONSTRAINT "AppVersionModelVersion_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppConnection" ADD CONSTRAINT "AppConnection_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppConnection" ADD CONSTRAINT "AppConnection_oauthTokensetId_fkey" FOREIGN KEY ("oauthTokensetId") REFERENCES "AppOAuthTokenSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppConnection" ADD CONSTRAINT "AppConnection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppConnectionSetting" ADD CONSTRAINT "AppConnectionSetting_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "AppConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppConnectionSetting" ADD CONSTRAINT "AppConnectionSetting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppOAuthTokenSet" ADD CONSTRAINT "AppOAuthTokenSet_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppOAuthTokenSet" ADD CONSTRAINT "AppOAuthTokenSet_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppOAuthClientSecret" ADD CONSTRAINT "AppOAuthClientSecret_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schema" ADD CONSTRAINT "Schema_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_appConnectionId_fkey" FOREIGN KEY ("appConnectionId") REFERENCES "AppConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_appVersionModelVersionAppVersionId_appVersionModelV_fkey" FOREIGN KEY ("appVersionModelVersionAppVersionId", "appVersionModelVersionModelVersionId") REFERENCES "AppVersionModelVersion"("appVersionId", "modelVersionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceModelConnection" ADD CONSTRAINT "WorkspaceModelConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceModelConnection" ADD CONSTRAINT "WorkspaceModelConnection_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceModelConnection" ADD CONSTRAINT "WorkspaceModelConnection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
