/*
  Warnings:

  - The primary key for the `EntityEmbedding` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `EntityEmbedding` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[entityId,embeddingId]` on the table `EntityEmbedding` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EntityEmbedding" DROP CONSTRAINT "EntityEmbedding_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "EntityEmbedding_entityId_embeddingId_key" ON "EntityEmbedding"("entityId", "embeddingId");
