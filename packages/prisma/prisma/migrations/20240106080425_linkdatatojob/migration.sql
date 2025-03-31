/*
  Warnings:

  - Added the required column `dataExtractionJobId` to the `Data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataId` to the `DataExtractionJobRule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Data" ADD COLUMN     "dataExtractionJobId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DataExtractionJobRule" ADD COLUMN     "dataId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_dataExtractionJobId_fkey" FOREIGN KEY ("dataExtractionJobId") REFERENCES "DataExtractionJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJobRule" ADD CONSTRAINT "DataExtractionJobRule_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "Data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
