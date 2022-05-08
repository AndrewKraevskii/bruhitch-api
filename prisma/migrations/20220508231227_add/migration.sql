/*
  Warnings:

  - Added the required column `refreshToken` to the `DonationAlerts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DonationAlerts" ADD COLUMN     "refreshToken" VARCHAR(256) NOT NULL;
