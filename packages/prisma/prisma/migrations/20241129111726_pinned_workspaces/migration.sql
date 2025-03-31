/*
  Warnings:

  - You are about to drop the column `hiddenWorkspaces` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceOrder` on the `UserPreferences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserPreferences" DROP COLUMN "hiddenWorkspaces",
DROP COLUMN "workspaceOrder",
ADD COLUMN     "lastUsedWorkspaceId" TEXT,
ADD COLUMN     "pinnedWorkspaces" TEXT[];

-- CreateIndex
CREATE INDEX "UserPreferences_lastUsedWorkspaceId_idx" ON "UserPreferences"("lastUsedWorkspaceId");
