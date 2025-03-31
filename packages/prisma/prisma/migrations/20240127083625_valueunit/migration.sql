-- CreateEnum
CREATE TYPE "CurrencyEnum" AS ENUM ('AUD', 'USD', 'CAD', 'EUR', 'GBP');

-- AlterTable
ALTER TABLE "NodeValue" ADD COLUMN     "unit" TEXT;
