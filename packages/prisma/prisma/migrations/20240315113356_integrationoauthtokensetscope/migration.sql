/*
  Warnings:

  - You are about to drop the column `access_token` on the `IntegrationOAuthTokenSet` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `IntegrationOAuthTokenSet` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `IntegrationOAuthTokenSet` table. All the data in the column will be lost.
  - Added the required column `accessToken` to the `IntegrationOAuthTokenSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `IntegrationOAuthTokenSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `IntegrationOAuthTokenSet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IntegrationOAuthTokenSet" DROP COLUMN "access_token",
DROP COLUMN "expires_at",
DROP COLUMN "refresh_token",
ADD COLUMN     "accessToken" TEXT NOT NULL,
ADD COLUMN     "expiresAt" INTEGER NOT NULL,
ADD COLUMN     "refreshToken" TEXT NOT NULL,
ADD COLUMN     "scope" TEXT;
