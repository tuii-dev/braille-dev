/*
  Warnings:

  - The primary key for the `Workspace` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `Workspace` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Workspace" DROP CONSTRAINT "Workspace_pkey",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "WorkspaceModel" (
    "workspaceId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceModel_pkey" PRIMARY KEY ("workspaceId","modelId")
);

-- AddForeignKey
ALTER TABLE "WorkspaceModel" ADD CONSTRAINT "WorkspaceModel_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceModel" ADD CONSTRAINT "WorkspaceModel_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceModel" ADD CONSTRAINT "WorkspaceModel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
