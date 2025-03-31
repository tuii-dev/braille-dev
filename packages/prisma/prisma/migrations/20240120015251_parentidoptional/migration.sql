-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_parentId_fkey";

-- AlterTable
ALTER TABLE "Node" ALTER COLUMN "parentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;
