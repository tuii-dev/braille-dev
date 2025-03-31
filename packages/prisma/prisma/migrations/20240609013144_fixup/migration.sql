/*
  Warnings:

  - You are about to drop the column `appVersionModelVersionAppVersionId` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `appVersionModelVersionModelVersionId` on the `Entity` table. All the data in the column will be lost.
  - Added the required column `appVersionId` to the `Entity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelVersionId` to the `Entity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Entity" DROP CONSTRAINT "Entity_appVersionModelVersionAppVersionId_appVersionModelV_fkey";

-- AlterTable
ALTER TABLE "Entity" DROP COLUMN "appVersionModelVersionAppVersionId",
DROP COLUMN "appVersionModelVersionModelVersionId",
ADD COLUMN     "appVersionId" TEXT NOT NULL,
ADD COLUMN     "modelVersionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_appVersionId_modelVersionId_fkey" FOREIGN KEY ("appVersionId", "modelVersionId") REFERENCES "AppVersionModelVersion"("appVersionId", "modelVersionId") ON DELETE RESTRICT ON UPDATE CASCADE;
