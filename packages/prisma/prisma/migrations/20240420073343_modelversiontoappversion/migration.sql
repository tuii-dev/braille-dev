-- AlterTable
ALTER TABLE "AppEntityModelVersion" ADD COLUMN     "appVersionId" TEXT;

-- AddForeignKey
ALTER TABLE "AppEntityModelVersion" ADD CONSTRAINT "AppEntityModelVersion_appVersionId_fkey" FOREIGN KEY ("appVersionId") REFERENCES "IntegrationVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
