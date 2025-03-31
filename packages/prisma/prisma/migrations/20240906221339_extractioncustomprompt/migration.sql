-- CreateTable
CREATE TABLE "DataExtractionJobCustomPrompt" (
    "id" TEXT NOT NULL,
    "dataExtractionJobId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "DataExtractionJobCustomPrompt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DataExtractionJobCustomPrompt" ADD CONSTRAINT "DataExtractionJobCustomPrompt_dataExtractionJobId_fkey" FOREIGN KEY ("dataExtractionJobId") REFERENCES "DataExtractionJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExtractionJobCustomPrompt" ADD CONSTRAINT "DataExtractionJobCustomPrompt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
