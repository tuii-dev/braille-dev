-- DropForeignKey
ALTER TABLE "ConnectionSetting" DROP CONSTRAINT "ConnectionSetting_integrationConfigurationId_fkey";

-- AddForeignKey
ALTER TABLE "ConnectionSetting" ADD CONSTRAINT "ConnectionSetting_integrationConfigurationId_fkey" FOREIGN KEY ("integrationConfigurationId") REFERENCES "IntegrationIngestionConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
