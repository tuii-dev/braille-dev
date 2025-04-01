/*
  Warnings:

  - Added the required column `tenantId` to the `App` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activeYN` to the `AppScheduledTriggerRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created` to the `AppScheduledTriggerRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated` to the `AppScheduledTriggerRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "App" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AppScheduledTriggerRegistration" ADD COLUMN     "activeYN" BOOLEAN NOT NULL,
ADD COLUMN     "created" INTEGER NOT NULL,
ADD COLUMN     "updated" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "created" TIMESTAMP(3),
ADD COLUMN     "email" TEXT,
ADD COLUMN     "operations" INTEGER,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "updated" TIMESTAMP(3),
ALTER COLUMN "name" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "App" ADD CONSTRAINT "App_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
