/*
  Warnings:

  - Changed the type of `result` on the `GamePlayer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "GameResult" AS ENUM ('win', 'lose', 'draw');

-- DropForeignKey
ALTER TABLE "Deck" DROP CONSTRAINT "Deck_heroId_fkey";

-- DropForeignKey
ALTER TABLE "Deck" DROP CONSTRAINT "Deck_userId_fkey";

-- DropForeignKey
ALTER TABLE "DeckCard" DROP CONSTRAINT "DeckCard_cardId_fkey";

-- DropForeignKey
ALTER TABLE "DeckCard" DROP CONSTRAINT "DeckCard_deckId_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_gameModeId_fkey";

-- DropForeignKey
ALTER TABLE "GamePlayer" DROP CONSTRAINT "GamePlayer_deckId_fkey";

-- DropForeignKey
ALTER TABLE "GamePlayer" DROP CONSTRAINT "GamePlayer_gameId_fkey";

-- DropForeignKey
ALTER TABLE "GamePlayer" DROP CONSTRAINT "GamePlayer_userId_fkey";

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "startedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "GamePlayer" DROP COLUMN "result",
ADD COLUMN     "result" "GameResult" NOT NULL;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_gameModeId_fkey" FOREIGN KEY ("gameModeId") REFERENCES "GameMode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
