-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "IntegrationOAuthClientSecret" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "integrationId" TEXT NOT NULL,

    CONSTRAINT "IntegrationOAuthClientSecret_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationOAuthClientSecret_integrationId_key" ON "IntegrationOAuthClientSecret"("integrationId");

-- AddForeignKey
ALTER TABLE "IntegrationOAuthClientSecret" ADD CONSTRAINT "IntegrationOAuthClientSecret_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
