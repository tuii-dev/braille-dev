/*
  Warnings:

  - Added the required column `nodeId` to the `NodeValueChange` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NodeValueChange" ADD COLUMN     "nodeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "NodeValueChange" ADD CONSTRAINT "NodeValueChange_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
