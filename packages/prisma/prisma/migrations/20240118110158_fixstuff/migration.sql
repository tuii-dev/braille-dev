-- AlterTable
ALTER TABLE "Field" ADD COLUMN     "parentFieldId" TEXT;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_parentFieldId_fkey" FOREIGN KEY ("parentFieldId") REFERENCES "Field"("id") ON DELETE SET NULL ON UPDATE CASCADE;
