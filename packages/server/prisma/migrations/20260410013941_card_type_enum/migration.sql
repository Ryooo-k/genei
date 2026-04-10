/*
  Warnings:

  - Changed the type of `cardType` on the `Card` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('unit', 'spell', 'field', 'art');

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "cardType",
ADD COLUMN     "cardType" "CardType" NOT NULL;

-- AlterTable
ALTER TABLE "GamePlayer" ALTER COLUMN "result" DROP NOT NULL;
