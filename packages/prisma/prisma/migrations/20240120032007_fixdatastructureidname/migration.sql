/*
  Warnings:

  - You are about to drop the column `dataStructureVersionId` on the `DataExtractionJob` table. All the data in the column will be lost.
  - Added the required column `modelVersionId` to the `DataExtractionJob` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DataExtractionJob" DROP CONSTRAINT "DataExtractionJob_dataStructureVersionId_fkey";

-- AlterTable
ALTER TABLE "DataExtractionJob" DROP COLUMN "dataStructureVersionId",
ADD COLUMN     "modelVersionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ModelVersion" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "DataExtractionJob" ADD CONSTRAINT "DataExtractionJob_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
