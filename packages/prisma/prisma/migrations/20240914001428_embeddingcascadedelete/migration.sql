-- DropForeignKey
ALTER TABLE "EntityEmbedding" DROP CONSTRAINT "EntityEmbedding_embeddingId_fkey";

-- DropForeignKey
ALTER TABLE "EntityEmbedding" DROP CONSTRAINT "EntityEmbedding_entityId_fkey";

-- DropForeignKey
ALTER TABLE "EntityEmbedding" DROP CONSTRAINT "EntityEmbedding_tenantId_fkey";

-- AddForeignKey
ALTER TABLE "EntityEmbedding" ADD CONSTRAINT "EntityEmbedding_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityEmbedding" ADD CONSTRAINT "EntityEmbedding_embeddingId_fkey" FOREIGN KEY ("embeddingId") REFERENCES "Embedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityEmbedding" ADD CONSTRAINT "EntityEmbedding_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
