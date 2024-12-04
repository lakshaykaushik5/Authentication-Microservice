-- CreateEnum
CREATE TYPE "result" AS ENUM ('WIN', 'LOSE', 'DRAW', 'PROGRESS');

-- CreateTable
CREATE TABLE "master_games" (
    "id" SERIAL NOT NULL,
    "white_player" INTEGER NOT NULL,
    "black_player" INTEGER NOT NULL,
    "game_status" BOOLEAN NOT NULL,
    "game_result" "result" NOT NULL,
    "game" TEXT NOT NULL,

    CONSTRAINT "master_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "userpassword" TEXT NOT NULL,
    "usermail" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_users_usermail_key" ON "master_users"("usermail");
