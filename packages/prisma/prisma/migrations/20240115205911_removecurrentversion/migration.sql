/*
  Warnings:

  - You are about to drop the column `currentVersionId` on the `DataStructure` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DataStructure" DROP CONSTRAINT "DataStructure_currentVersionId_fkey";

-- DropIndex
DROP INDEX "DataStructure_currentVersionId_key";

-- AlterTable
ALTER TABLE "DataStructure" DROP COLUMN "currentVersionId";

-- AlterTable
ALTER TABLE "DataStructureVersion" ADD COLUMN     "isCurrentVersion" BOOLEAN NOT NULL DEFAULT false;
