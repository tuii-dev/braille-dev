/*
  Warnings:

  - Added the required column `tenantId` to the `ConnectionSetting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ConnectionSetting" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ConnectionSetting" ADD CONSTRAINT "ConnectionSetting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
