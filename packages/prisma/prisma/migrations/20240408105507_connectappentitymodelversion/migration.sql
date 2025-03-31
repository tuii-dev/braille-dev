/*
  Warnings:

  - Added the required column `modelId` to the `AppEntityModelVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppEntityModelVersion" ADD COLUMN     "modelId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AppEntityModelVersion" ADD CONSTRAINT "AppEntityModelVersion_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AppEntityModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
