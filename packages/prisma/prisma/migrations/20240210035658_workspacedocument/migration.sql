-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('ADMIN');

-- AlterTable
ALTER TABLE "DataExtractionJob" ADD COLUMN     "workspaceDocumentId" TEXT;

-- CreateTable
CREATE TABLE "UserSystemRole" (
    "role" "SystemRole" NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "WorkspaceDocument" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSystemRole_role_userId_key" ON "UserSystemRole"("role", "userId");

-- AddForeignKey
ALTER TABLE "UserSystemRole" ADD CONSTRAINT "UserSystemRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceDocument" ADD CONSTRAINT "WorkspaceDocument_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceDocument" ADD CONSTRAINT "WorkspaceDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceDocument" ADD CONSTRAINT "WorkspaceDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_workspaceDocumentId_fkey" FOREIGN KEY ("workspaceDocumentId") REFERENCES "WorkspaceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
