-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('FIRST_PARTY', 'THIRD_PARTY');

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "type" "ActionType" NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataActionTask" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "dataId" TEXT NOT NULL,

    CONSTRAINT "DataActionTask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DataActionTask" ADD CONSTRAINT "DataActionTask_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataActionTask" ADD CONSTRAINT "DataActionTask_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "Data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
