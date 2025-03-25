/*
  Warnings:

  - Added the required column `userId` to the `master_session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `master_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenCreatedAt` to the `master_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "master_session" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "master_users" ADD COLUMN     "role" INTEGER NOT NULL,
ADD COLUMN     "tokenCreatedAt" TIMESTAMP(3) NOT NULL;
