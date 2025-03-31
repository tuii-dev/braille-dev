/*
  Warnings:

  - You are about to drop the column `appConnectionId` on the `Entity` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dataId]` on the table `DataExtractionJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Entity" DROP CONSTRAINT "Entity_appConnectionId_fkey";

-- AlterTable
ALTER TABLE "Entity" DROP COLUMN "appConnectionId";

-- CreateIndex
CREATE UNIQUE INDEX "DataExtractionJob_dataId_key" ON "DataExtractionJob"("dataId");
