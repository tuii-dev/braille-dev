/*
  Warnings:

  - Added the required column `integrationId` to the `IntegrationIngestionConfiguration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IntegrationIngestionConfiguration" ADD COLUMN     "integrationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "IntegrationIngestionConfiguration" ADD CONSTRAINT "IntegrationIngestionConfiguration_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
