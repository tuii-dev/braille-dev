/*
  Warnings:

  - A unique constraint covering the columns `[dataExtractionJobId]` on the table `Data` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Data_dataExtractionJobId_key" ON "Data"("dataExtractionJobId");
