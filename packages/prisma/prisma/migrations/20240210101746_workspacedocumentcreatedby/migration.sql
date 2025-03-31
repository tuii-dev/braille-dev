/*
  Warnings:

  - Added the required column `createdById` to the `WorkspaceDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkspaceDocument" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkspaceDocument" ADD CONSTRAINT "WorkspaceDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
