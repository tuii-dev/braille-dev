/*
  Warnings:

  - Added the required column `schema` to the `IntegrationVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IntegrationVersion" ADD COLUMN     "schema" JSONB NOT NULL;
