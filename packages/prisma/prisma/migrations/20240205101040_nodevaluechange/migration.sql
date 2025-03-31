-- CreateTable
CREATE TABLE "NodeValueChange" (
    "id" TEXT NOT NULL,
    "value" TEXT,
    "unit" TEXT,
    "nodeValueId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "NodeValueChange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NodeValueChange" ADD CONSTRAINT "NodeValueChange_nodeValueId_fkey" FOREIGN KEY ("nodeValueId") REFERENCES "NodeValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeValueChange" ADD CONSTRAINT "NodeValueChange_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeValueChange" ADD CONSTRAINT "NodeValueChange_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
