/*
  Warnings:

  - You are about to drop the column `actionExectutionId` on the `ActionOuputs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,actionExecutionId]` on the table `ActionOuputs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `actionExecutionId` to the `ActionOuputs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ActionOuputs" DROP CONSTRAINT "ActionOuputs_actionExectutionId_fkey";

-- DropIndex
DROP INDEX "ActionOuputs_name_actionExectutionId_key";

-- AlterTable
ALTER TABLE "ActionOuputs" DROP COLUMN "actionExectutionId",
ADD COLUMN     "actionExecutionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ActionOuputs_name_actionExecutionId_key" ON "ActionOuputs"("name", "actionExecutionId");

-- AddForeignKey
ALTER TABLE "ActionOuputs" ADD CONSTRAINT "ActionOuputs_actionExecutionId_fkey" FOREIGN KEY ("actionExecutionId") REFERENCES "ActionExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
