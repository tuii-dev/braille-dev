/*
  Warnings:

  - You are about to drop the `_DataStructureToDataStructureVersion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DataStructureToDataStructureVersion" DROP CONSTRAINT "_DataStructureToDataStructureVersion_A_fkey";

-- DropForeignKey
ALTER TABLE "_DataStructureToDataStructureVersion" DROP CONSTRAINT "_DataStructureToDataStructureVersion_B_fkey";

-- DropTable
DROP TABLE "_DataStructureToDataStructureVersion";
