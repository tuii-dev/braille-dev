/*
  Warnings:

  - Added the required column `nodeId` to the `NodeValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NodeValue" ADD COLUMN     "nodeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "NodeValue" ADD CONSTRAINT "NodeValue_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
