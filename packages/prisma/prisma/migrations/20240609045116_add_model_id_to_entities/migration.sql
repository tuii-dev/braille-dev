/*
  Warnings:

  - You are about to drop the column `appVersionId` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the `WorkspaceModelConnection` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `modelId` to the `Entity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Entity" DROP CONSTRAINT "Entity_appVersionId_modelVersionId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceModelConnection" DROP CONSTRAINT "WorkspaceModelConnection_modelId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceModelConnection" DROP CONSTRAINT "WorkspaceModelConnection_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceModelConnection" DROP CONSTRAINT "WorkspaceModelConnection_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Entity" DROP COLUMN "appVersionId",
ADD COLUMN     "modelId" TEXT NOT NULL;

-- DropTable
DROP TABLE "WorkspaceModelConnection";

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
