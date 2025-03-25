/*
  Warnings:

  - Added the required column `refreshToken` to the `master_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "master_users" ADD COLUMN     "refreshToken" TEXT NOT NULL;
