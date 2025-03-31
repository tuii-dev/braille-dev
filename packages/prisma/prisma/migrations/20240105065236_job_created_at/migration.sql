/*
  Warnings:

  - Added the required column `updatedAt` to the `Data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DataExtractionJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DataExtractionJobRule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Data" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DataExtractionJob" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DataExtractionJobRule" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
