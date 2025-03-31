/*
  Warnings:

  - Added the required column `structureId` to the `DataExtractionJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DataExtractionJob" ADD COLUMN     "structureId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "DataStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
