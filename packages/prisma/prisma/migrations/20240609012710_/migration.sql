/*
  Warnings:

  - You are about to drop the column `appId` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `appVersionId` on the `ModelVersion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_appId_fkey";

-- DropForeignKey
ALTER TABLE "ModelVersion" DROP CONSTRAINT "ModelVersion_appVersionId_fkey";

-- AlterTable
ALTER TABLE "Model" DROP COLUMN "appId";

-- AlterTable
ALTER TABLE "ModelVersion" DROP COLUMN "appVersionId";

-- CreateTable
CREATE TABLE "AppEntityModel" (
    "appId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,

    CONSTRAINT "AppEntityModel_pkey" PRIMARY KEY ("appId","modelId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppEntityModel_modelId_key" ON "AppEntityModel"("modelId");

-- AddForeignKey
ALTER TABLE "AppEntityModel" ADD CONSTRAINT "AppEntityModel_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppEntityModel" ADD CONSTRAINT "AppEntityModel_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
