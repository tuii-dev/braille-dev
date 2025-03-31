/*
  Warnings:

  - You are about to drop the column `workspaceVisibility` on the `UserPreferences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserPreferences" DROP COLUMN "workspaceVisibility",
ADD COLUMN     "hiddenWorkspaces" TEXT[],
ALTER COLUMN "lastModifiedAt" SET DEFAULT CURRENT_TIMESTAMP;
