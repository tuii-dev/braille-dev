-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'RUNNING', 'FINISHED', 'FAILED');

-- AlterTable
ALTER TABLE "DataActionTask" ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'PENDING';
