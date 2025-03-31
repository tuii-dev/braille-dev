/*
  Warnings:

  - The required column `id` was added to the `ActionExecutionError` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "ActionExecutionError_actionExecutionId_key";

-- AlterTable
ALTER TABLE "ActionExecutionError" ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "log" TEXT,
ADD CONSTRAINT "ActionExecutionError_pkey" PRIMARY KEY ("id");
