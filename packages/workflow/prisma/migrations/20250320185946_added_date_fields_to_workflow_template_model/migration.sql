-- AlterTable
ALTER TABLE "WorkflowTemplate" ADD COLUMN     "created" TIMESTAMP(3),
ADD COLUMN     "deleted" BOOLEAN,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updated" TIMESTAMP(3);
