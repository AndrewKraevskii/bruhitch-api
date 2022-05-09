-- CreateTable
CREATE TABLE "DonateSettings" (
    "id" TEXT NOT NULL,
    "usernameColor" VARCHAR(8) NOT NULL DEFAULT E'#3BEDA9',
    "isGradientUsername" BOOLEAN NOT NULL DEFAULT false,
    "currencyColor" VARCHAR(8) NOT NULL DEFAULT E'#A6A6A6',
    "isGradientCurrency" BOOLEAN NOT NULL DEFAULT false,
    "soundColor" VARCHAR(8) NOT NULL DEFAULT E'#C05DEF',
    "textColor" VARCHAR(8) NOT NULL DEFAULT E'#CCCCCC',
    "anonymous" VARCHAR(32) NOT NULL DEFAULT E'Anonymous',
    "image" VARCHAR(256) NOT NULL DEFAULT E'https://i.postimg.cc/9F2qyTQc/photo-2022-05-05-09-31-08.jpg',
    "hideDelay" INTEGER NOT NULL DEFAULT 5000,
    "font" VARCHAR(32) NOT NULL DEFAULT E'',
    "fontSize" INTEGER NOT NULL DEFAULT 16,
    "disablePadding" BOOLEAN NOT NULL DEFAULT false,
    "animation" VARCHAR(8) NOT NULL DEFAULT E'fade',
    "animationEasing" VARCHAR(16) NOT NULL DEFAULT E'linear',
    "animationParams" JSONB NOT NULL DEFAULT '{}',
    "vertical" VARCHAR(8) NOT NULL DEFAULT E'top',
    "userId" VARCHAR(16) NOT NULL,

    CONSTRAINT "DonateSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DonateSettings_userId_key" ON "DonateSettings"("userId");

-- AddForeignKey
ALTER TABLE "DonateSettings" ADD CONSTRAINT "DonateSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
