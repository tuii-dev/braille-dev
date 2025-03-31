/*
  Warnings:

  - Added the required column `tenantId` to the `ActionExectution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActionExectution" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ActionExectution" ADD CONSTRAINT "ActionExectution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
