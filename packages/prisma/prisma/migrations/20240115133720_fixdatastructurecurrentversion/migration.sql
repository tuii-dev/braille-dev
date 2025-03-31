/*
  Warnings:

  - Added the required column `dataStructureVersionId` to the `DataStructure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DataStructure" ADD COLUMN     "dataStructureVersionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_DataStructureToDataStructureVersion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DataStructureToDataStructureVersion_AB_unique" ON "_DataStructureToDataStructureVersion"("A", "B");

-- CreateIndex
CREATE INDEX "_DataStructureToDataStructureVersion_B_index" ON "_DataStructureToDataStructureVersion"("B");

-- AddForeignKey
ALTER TABLE "_DataStructureToDataStructureVersion" ADD CONSTRAINT "_DataStructureToDataStructureVersion_A_fkey" FOREIGN KEY ("A") REFERENCES "DataStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DataStructureToDataStructureVersion" ADD CONSTRAINT "_DataStructureToDataStructureVersion_B_fkey" FOREIGN KEY ("B") REFERENCES "DataStructureVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
