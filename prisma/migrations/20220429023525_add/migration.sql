-- CreateTable
CREATE TABLE "FollowSettings" (
    "id" TEXT NOT NULL,
    "pattern" TEXT NOT NULL DEFAULT E'$username$ just followed',
    "disablePadding" BOOLEAN NOT NULL DEFAULT false,
    "fontSize" INTEGER NOT NULL DEFAULT 16,
    "font" TEXT NOT NULL DEFAULT E'',
    "textColor" TEXT NOT NULL DEFAULT E'#fafafa',
    "backgroundColor" TEXT NOT NULL DEFAULT E'#171717',
    "backgroundImage" TEXT NOT NULL DEFAULT E'',
    "colorNickname" TEXT NOT NULL DEFAULT E'#8CF2A5',
    "isGradientNickname" BOOLEAN NOT NULL DEFAULT false,
    "animation" TEXT NOT NULL DEFAULT E'fade',
    "animationEasing" TEXT NOT NULL DEFAULT E'linear',
    "animationParams" JSONB NOT NULL DEFAULT '{}',
    "vertical" TEXT NOT NULL DEFAULT E'top',
    "horizontal" TEXT NOT NULL DEFAULT E'left',
    "twitchTokenId" TEXT NOT NULL,

    CONSTRAINT "FollowSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FollowSettings_twitchTokenId_key" ON "FollowSettings"("twitchTokenId");

-- AddForeignKey
ALTER TABLE "FollowSettings" ADD CONSTRAINT "FollowSettings_twitchTokenId_fkey" FOREIGN KEY ("twitchTokenId") REFERENCES "TwitchToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;
