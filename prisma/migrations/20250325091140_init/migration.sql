/*
  Warnings:

  - You are about to drop the `master_games` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `refreshToken` to the `master_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenVersion` to the `master_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "master_users" ADD COLUMN     "refreshToken" TEXT NOT NULL,
ADD COLUMN     "tokenVersion" INTEGER NOT NULL;

-- DropTable
DROP TABLE "master_games";

-- DropEnum
DROP TYPE "result";

-- CreateTable
CREATE TABLE "master_session" (
    "id" SERIAL NOT NULL,
    "sessionName" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_session_pkey" PRIMARY KEY ("id")
);
