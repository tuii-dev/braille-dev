/*
  Warnings:

  - Added the required column `cronSchedule` to the `AppScheduledTriggerRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppScheduledTriggerRegistration" ADD COLUMN     "cronSchedule" TEXT NOT NULL;
