-- CreateTable
CREATE TABLE "Workspace" (
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("slug","tenantId")
);

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
