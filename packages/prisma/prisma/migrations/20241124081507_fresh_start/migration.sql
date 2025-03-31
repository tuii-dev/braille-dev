/*
  Warnings:

  - Added the required column `updatedAt` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Backfill updatedAt with createdAt for all tables where updatedAt is null
UPDATE "User"
SET "updatedAt" = "createdAt"
WHERE "updatedAt" IS NULL;

UPDATE "Workspace"
SET "updatedAt" = "createdAt"
WHERE "updatedAt" IS NULL;

UPDATE "Model"
SET "updatedAt" = "createdAt"
WHERE "updatedAt" IS NULL;

ALTER TABLE "User"
ALTER COLUMN "updatedAt" SET NOT NULL;

ALTER TABLE "Workspace"
ALTER COLUMN "updatedAt" SET NOT NULL;

ALTER TABLE "Model"
ALTER COLUMN "updatedAt" SET NOT NULL;