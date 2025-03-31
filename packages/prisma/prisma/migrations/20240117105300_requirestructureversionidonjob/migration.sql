/*
  Warnings:

  - Made the column `dataStructureVersionId` on table `DataExtractionJob` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "DataExtractionJob" DROP CONSTRAINT "DataExtractionJob_dataStructureVersionId_fkey";

-- AlterTable
ALTER TABLE "DataExtractionJob" ALTER COLUMN "dataStructureVersionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_dataStructureVersionId_fkey" FOREIGN KEY ("dataStructureVersionId") REFERENCES "DataStructureVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
