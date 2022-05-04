/*
  Warnings:

  - You are about to drop the column `backgroundColor` on the `FollowSettings` table. All the data in the column will be lost.
  - You are about to drop the column `textColor` on the `FollowSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FollowSettings" DROP COLUMN "backgroundColor",
DROP COLUMN "textColor";

-- CreateTable
CREATE TABLE "SubscribeSettings" (
    "id" TEXT NOT NULL,
    "subPattern" TEXT NOT NULL DEFAULT E'![alt](https://cdn.7tv.app/emote/60ccf4479f5edeff9938fa77/4x) $username$ just subscribed',
    "giftPattern" TEXT NOT NULL DEFAULT E'![alt](https://cdn.7tv.app/emote/60ccf4479f5edeff9938fa77/4x) $username$ gift sub to $recipient$',
    "giftMultiMonthPattern" TEXT NOT NULL DEFAULT E'![alt](https://cdn.7tv.app/emote/60ccf4479f5edeff9938fa77/4x) $username$ gift sub to $recipient$ on $duration$ months',
    "anonymous" VARCHAR(32) NOT NULL DEFAULT E'Anonymous',
    "disablePadding" BOOLEAN NOT NULL DEFAULT false,
    "fontSize" INTEGER NOT NULL DEFAULT 16,
    "font" VARCHAR(32) NOT NULL DEFAULT E'',
    "image" VARCHAR(256) NOT NULL DEFAULT E'',
    "usernameColor" VARCHAR(8) NOT NULL DEFAULT E'#8CF2A5',
    "isGradientUsername" BOOLEAN NOT NULL DEFAULT false,
    "recipientColor" VARCHAR(8) NOT NULL DEFAULT E'#8CF2A5',
    "isGradientRecipient" BOOLEAN NOT NULL DEFAULT false,
    "animation" VARCHAR(8) NOT NULL DEFAULT E'fade',
    "animationEasing" VARCHAR(16) NOT NULL DEFAULT E'linear',
    "animationParams" JSONB NOT NULL DEFAULT '{}',
    "vertical" VARCHAR(8) NOT NULL DEFAULT E'top',
    "userId" VARCHAR(16) NOT NULL,

    CONSTRAINT "SubscribeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscribeSettings_userId_key" ON "SubscribeSettings"("userId");

-- AddForeignKey
ALTER TABLE "SubscribeSettings" ADD CONSTRAINT "SubscribeSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
