-- CreateTable
CREATE TABLE "ConnectionSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "integrationConfigurationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectionSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConnectionSetting" ADD CONSTRAINT "ConnectionSetting_integrationConfigurationId_fkey" FOREIGN KEY ("integrationConfigurationId") REFERENCES "IntegrationIngestionConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
