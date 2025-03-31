-- CreateTable
CREATE TABLE "IntegrationIngestionConfiguration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "oauthTokensetId" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "IntegrationIngestionConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationOAuthTokenSet" (
    "id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" INTEGER NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "IntegrationOAuthTokenSet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IntegrationIngestionConfiguration" ADD CONSTRAINT "IntegrationIngestionConfiguration_oauthTokensetId_fkey" FOREIGN KEY ("oauthTokensetId") REFERENCES "IntegrationOAuthTokenSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationIngestionConfiguration" ADD CONSTRAINT "IntegrationIngestionConfiguration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationOAuthTokenSet" ADD CONSTRAINT "IntegrationOAuthTokenSet_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationOAuthTokenSet" ADD CONSTRAINT "IntegrationOAuthTokenSet_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
