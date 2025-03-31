-- CreateEnum
CREATE TYPE "ConnectionSettingType" AS ENUM ('SETTING', 'COMPUTED');

-- AlterTable
ALTER TABLE "ConnectionSetting" ADD COLUMN     "type" "ConnectionSettingType" DEFAULT 'SETTING';
