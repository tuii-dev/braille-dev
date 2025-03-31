/*
  Warnings:

  - You are about to drop the column `type` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `actionId` on the `DataActionTask` table. All the data in the column will be lost.
  - Added the required column `integrationId` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actionVersionId` to the `DataActionTask` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PublisherType" AS ENUM ('FIRST_PARTY', 'THIRD_PARTY');

-- DropForeignKey
ALTER TABLE "DataActionTask" DROP CONSTRAINT "DataActionTask_actionId_fkey";

-- AlterTable
ALTER TABLE "Action" DROP COLUMN "type",
ADD COLUMN     "integrationId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DataActionTask" DROP COLUMN "actionId",
ADD COLUMN     "actionVersionId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "ActionType";

-- CreateTable
CREATE TABLE "IntegrationPublisher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "IntegrationPublisher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "integrationPublisherId" TEXT NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionVersion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,

    CONSTRAINT "ActionVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_integrationPublisherId_fkey" FOREIGN KEY ("integrationPublisherId") REFERENCES "IntegrationPublisher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionVersion" ADD CONSTRAINT "ActionVersion_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataActionTask" ADD CONSTRAINT "DataActionTask_actionVersionId_fkey" FOREIGN KEY ("actionVersionId") REFERENCES "ActionVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
