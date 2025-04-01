-- AlterTable
ALTER TABLE "App" ADD COLUMN     "created" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "updated" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AppScheduledTriggerRegistration" ALTER COLUMN "created" DROP NOT NULL,
ALTER COLUMN "created" SET DATA TYPE TEXT,
ALTER COLUMN "updated" DROP NOT NULL,
ALTER COLUMN "updated" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Tenant" ALTER COLUMN "created" SET DATA TYPE TEXT,
ALTER COLUMN "updated" SET DATA TYPE TEXT;
