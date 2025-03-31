/*
  Warnings:

  - Added the required column `schema` to the `AppVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppVersion" ADD COLUMN     "schema" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "name" TEXT;
