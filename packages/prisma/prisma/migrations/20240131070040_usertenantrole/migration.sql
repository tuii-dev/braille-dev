-- CreateEnum
CREATE TYPE "TenantRole" AS ENUM ('ADMIN');

-- CreateTable
CREATE TABLE "UserTenantRole" (
    "role" "TenantRole" NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTenantRole_role_userId_tenantId_key" ON "UserTenantRole"("role", "userId", "tenantId");

-- AddForeignKey
ALTER TABLE "UserTenantRole" ADD CONSTRAINT "UserTenantRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTenantRole" ADD CONSTRAINT "UserTenantRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
