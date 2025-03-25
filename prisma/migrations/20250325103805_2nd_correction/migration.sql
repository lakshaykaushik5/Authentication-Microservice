/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `master_users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "master_users" DROP COLUMN "refreshToken";
