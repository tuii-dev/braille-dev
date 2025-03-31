/*
  Warnings:

  - You are about to drop the column `createdAt` on the `NodeValue` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `NodeValue` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "NodeValue" DROP CONSTRAINT "NodeValue_createdById_fkey";

-- AlterTable
ALTER TABLE "NodeValue" DROP COLUMN "createdAt",
DROP COLUMN "createdById";
