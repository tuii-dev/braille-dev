/*
  Warnings:

  - Added the required column `appId` to the `Entity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "appId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
