/*
  Warnings:

  - You are about to drop the column `versionNodeId` on the `ModelVersion` table. All the data in the column will be lost.
  - You are about to drop the column `modelVersionId` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `parentFieldId` on the `Node` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ModelVersion" DROP CONSTRAINT "ModelVersion_versionNodeId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_modelVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_parentFieldId_fkey";

-- AlterTable
ALTER TABLE "ModelVersion" DROP COLUMN "versionNodeId";

-- AlterTable
ALTER TABLE "Node" DROP COLUMN "modelVersionId",
DROP COLUMN "parentFieldId";

-- CreateTable
CREATE TABLE "_Tree" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Tree_AB_unique" ON "_Tree"("A", "B");

-- CreateIndex
CREATE INDEX "_Tree_B_index" ON "_Tree"("B");

-- AddForeignKey
ALTER TABLE "_Tree" ADD CONSTRAINT "_Tree_A_fkey" FOREIGN KEY ("A") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Tree" ADD CONSTRAINT "_Tree_B_fkey" FOREIGN KEY ("B") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
