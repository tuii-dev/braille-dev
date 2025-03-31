/*
  Warnings:

  - You are about to drop the column `usage_total_tokens` on the `OpenAiUsage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OpenAiUsage" DROP COLUMN "usage_total_tokens",
ADD COLUMN     "dataExtractionJobId" TEXT;

-- AddForeignKey
ALTER TABLE "OpenAiUsage" ADD CONSTRAINT "OpenAiUsage_dataExtractionJobId_fkey" FOREIGN KEY ("dataExtractionJobId") REFERENCES "DataExtractionJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
