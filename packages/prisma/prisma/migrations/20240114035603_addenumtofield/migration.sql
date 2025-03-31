/*
  Warnings:

  - The values [DATETIME] on the enum `FieldDataTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FieldDataTypeEnum_new" AS ENUM ('STRING', 'NUMBER', 'ENUM', 'DATE', 'ARRAY', 'BOOLEAN');
ALTER TABLE "Field" ALTER COLUMN "type" TYPE "FieldDataTypeEnum_new" USING ("type"::text::"FieldDataTypeEnum_new");
ALTER TYPE "FieldDataTypeEnum" RENAME TO "FieldDataTypeEnum_old";
ALTER TYPE "FieldDataTypeEnum_new" RENAME TO "FieldDataTypeEnum";
DROP TYPE "FieldDataTypeEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "Field" ADD COLUMN     "enum" TEXT[];
