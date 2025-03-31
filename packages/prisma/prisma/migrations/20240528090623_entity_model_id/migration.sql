-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "entityModelId" TEXT;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_entityModelId_fkey" FOREIGN KEY ("entityModelId") REFERENCES "AppEntityModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
