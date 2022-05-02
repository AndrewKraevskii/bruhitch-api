-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(16) NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "avatar" VARCHAR(256) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(16) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Twitch" (
    "id" TEXT NOT NULL,
    "accessToken" VARCHAR(256) NOT NULL,
    "refreshToken" VARCHAR(256) NOT NULL,
    "userId" VARCHAR(16) NOT NULL,

    CONSTRAINT "Twitch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwitchToken" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(16) NOT NULL,

    CONSTRAINT "TwitchToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSettings" (
    "id" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "userId" VARCHAR(16) NOT NULL,

    CONSTRAINT "ChatSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowSettings" (
    "id" TEXT NOT NULL,
    "pattern" TEXT NOT NULL DEFAULT E'$username$ just followed',
    "disablePadding" BOOLEAN NOT NULL DEFAULT false,
    "fontSize" INTEGER NOT NULL DEFAULT 16,
    "font" VARCHAR(32) NOT NULL DEFAULT E'',
    "textColor" VARCHAR(8) NOT NULL DEFAULT E'#fafafa',
    "backgroundColor" VARCHAR(8) NOT NULL DEFAULT E'#171717',
    "backgroundImage" VARCHAR(256) NOT NULL DEFAULT E'',
    "colorNickname" VARCHAR(8) NOT NULL DEFAULT E'#8CF2A5',
    "isGradientNickname" BOOLEAN NOT NULL DEFAULT false,
    "animation" VARCHAR(8) NOT NULL DEFAULT E'fade',
    "animationEasing" VARCHAR(16) NOT NULL DEFAULT E'linear',
    "animationParams" JSONB NOT NULL DEFAULT '{}',
    "vertical" VARCHAR(8) NOT NULL DEFAULT E'top',
    "horizontal" VARCHAR(8) NOT NULL DEFAULT E'left',
    "userId" VARCHAR(16) NOT NULL,

    CONSTRAINT "FollowSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_userId_key" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Twitch_userId_key" ON "Twitch"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TwitchToken_userId_key" ON "TwitchToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatSettings_userId_key" ON "ChatSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FollowSettings_userId_key" ON "FollowSettings"("userId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Twitch" ADD CONSTRAINT "Twitch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwitchToken" ADD CONSTRAINT "TwitchToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSettings" ADD CONSTRAINT "ChatSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowSettings" ADD CONSTRAINT "FollowSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
