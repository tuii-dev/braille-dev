/*
  Warnings:

  - You are about to drop the column `structureId` on the `DataExtractionJob` table. All the data in the column will be lost.
  - Added the required column `modelId` to the `DataExtractionJob` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DataExtractionJob" DROP CONSTRAINT "DataExtractionJob_structureId_fkey";

-- AlterTable
ALTER TABLE "DataExtractionJob" DROP COLUMN "structureId",
ADD COLUMN     "modelId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
