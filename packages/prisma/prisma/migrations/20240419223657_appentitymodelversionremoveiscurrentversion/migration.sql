/*
  Warnings:

  - You are about to drop the column `isCurrentVersion` on the `AppEntityModelVersion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AppEntityModelVersion" DROP COLUMN "isCurrentVersion";

-- CreateTable
CREATE TABLE "IntegrationVersion" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IntegrationVersion" ADD CONSTRAINT "IntegrationVersion_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
