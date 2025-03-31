-- DropForeignKey
ALTER TABLE "FieldValue" DROP CONSTRAINT "FieldValue_parentFieldValueId_fkey";

-- AlterTable
ALTER TABLE "FieldValue" ALTER COLUMN "parentFieldValueId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FieldValue" ADD CONSTRAINT "FieldValue_parentFieldValueId_fkey" FOREIGN KEY ("parentFieldValueId") REFERENCES "FieldValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
