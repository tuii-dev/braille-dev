-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN "workspaceOrder" TEXT[] DEFAULT ARRAY[]::TEXT[];
