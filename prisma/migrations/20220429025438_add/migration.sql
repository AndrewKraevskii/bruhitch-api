/*
  Warnings:

  - You are about to alter the column `userId` on the `ChatSettings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(16)`.
  - You are about to alter the column `font` on the `FollowSettings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `textColor` on the `FollowSettings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(8)`.
  - You are about to alter the column `backgroundColor` on the `FollowSettings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(8)`.
  - You are about to alter the column `backgroundImage` on the `FollowSettings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(256)`.
  - You are about to alter the column `colorNickname` on the `FollowSettings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(8)`.
  - You are about to alter the column `animation` on the `FollowSettings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(8)`.
  - You are about to alter the column `animationEasing` on the `FollowSettings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(16)`.
  - You are about to alter the column `vertical` on the `FollowSettings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(8)`.
  - You are about to alter the column `horizontal` on the `FollowSettings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(8)`.
  - You are about to alter the column `twitchTokenId` on the `FollowSettings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `userId` on the `RefreshToken` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(16)`.
  - You are about to alter the column `userId` on the `Twitch` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(16)`.
  - You are about to alter the column `userId` on the `TwitchToken` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(16)`.

*/
-- DropForeignKey
ALTER TABLE "ChatSettings" DROP CONSTRAINT "ChatSettings_userId_fkey";

-- DropForeignKey
ALTER TABLE "FollowSettings" DROP CONSTRAINT "FollowSettings_twitchTokenId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "Twitch" DROP CONSTRAINT "Twitch_userId_fkey";

-- DropForeignKey
ALTER TABLE "TwitchToken" DROP CONSTRAINT "TwitchToken_userId_fkey";

-- AlterTable
ALTER TABLE "ChatSettings" ALTER COLUMN "userId" SET DATA TYPE VARCHAR(16);

-- AlterTable
ALTER TABLE "FollowSettings" ALTER COLUMN "font" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "textColor" SET DATA TYPE VARCHAR(8),
ALTER COLUMN "backgroundColor" SET DATA TYPE VARCHAR(8),
ALTER COLUMN "backgroundImage" SET DATA TYPE VARCHAR(256),
ALTER COLUMN "colorNickname" SET DATA TYPE VARCHAR(8),
ALTER COLUMN "animation" SET DATA TYPE VARCHAR(8),
ALTER COLUMN "animationEasing" SET DATA TYPE VARCHAR(16),
ALTER COLUMN "vertical" SET DATA TYPE VARCHAR(8),
ALTER COLUMN "horizontal" SET DATA TYPE VARCHAR(8),
ALTER COLUMN "twitchTokenId" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "userId" SET DATA TYPE VARCHAR(16);

-- AlterTable
ALTER TABLE "Twitch" ALTER COLUMN "userId" SET DATA TYPE VARCHAR(16);

-- AlterTable
ALTER TABLE "TwitchToken" ALTER COLUMN "userId" SET DATA TYPE VARCHAR(16);

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Twitch" ADD CONSTRAINT "Twitch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwitchToken" ADD CONSTRAINT "TwitchToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSettings" ADD CONSTRAINT "ChatSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowSettings" ADD CONSTRAINT "FollowSettings_twitchTokenId_fkey" FOREIGN KEY ("twitchTokenId") REFERENCES "TwitchToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;
