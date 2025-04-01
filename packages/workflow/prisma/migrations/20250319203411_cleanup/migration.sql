/*
  Warnings:

  - The primary key for the `WorkflowExecution` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `WorkflowExecution` table. All the data in the column will be lost.
  - The primary key for the `WorkflowExecutionStep` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `WorkflowExecutionStep` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[executionId]` on the table `WorkflowExecution` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "WorkflowExecutionStep" DROP CONSTRAINT "WorkflowExecutionStep_executionId_fkey";

-- DropIndex
DROP INDEX "WorkflowExecutionStep_executionId_nodeId_idx";

-- AlterTable
ALTER TABLE "WorkflowExecution" DROP CONSTRAINT "WorkflowExecution_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("executionId");

-- AlterTable
ALTER TABLE "WorkflowExecutionStep" DROP CONSTRAINT "WorkflowExecutionStep_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "WorkflowExecutionStep_pkey" PRIMARY KEY ("executionId", "nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowExecution_executionId_key" ON "WorkflowExecution"("executionId");

-- AddForeignKey
ALTER TABLE "WorkflowExecutionStep" ADD CONSTRAINT "WorkflowExecutionStep_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "WorkflowExecution"("executionId") ON DELETE RESTRICT ON UPDATE CASCADE;
