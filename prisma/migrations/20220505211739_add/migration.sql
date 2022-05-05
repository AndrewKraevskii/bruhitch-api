-- CreateTable
CREATE TABLE "PredictionSettings" (
    "id" TEXT NOT NULL,
    "textColor" VARCHAR(8) NOT NULL DEFAULT E'#8CF2A5',
    "blueColor" VARCHAR(8) NOT NULL DEFAULT E'#5D90EF',
    "pinkColor" VARCHAR(8) NOT NULL DEFAULT E'#E75F5F',
    "channelPointImage" VARCHAR(256) NOT NULL DEFAULT E'https://static-cdn.jtvnw.net/channel-points-icons/215064792/5be9fe0b-62f4-4806-bdcf-d6d972417a54/icon-1.png',
    "disablePadding" BOOLEAN NOT NULL DEFAULT false,
    "fontSize" INTEGER NOT NULL DEFAULT 16,
    "font" VARCHAR(32) NOT NULL DEFAULT E'',
    "hideDelay" INTEGER NOT NULL DEFAULT 5000,
    "animation" VARCHAR(8) NOT NULL DEFAULT E'fade',
    "animationEasing" VARCHAR(16) NOT NULL DEFAULT E'linear',
    "animationParams" JSONB NOT NULL DEFAULT '{}',
    "vertical" VARCHAR(8) NOT NULL DEFAULT E'top',
    "userId" VARCHAR(16) NOT NULL,

    CONSTRAINT "PredictionSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PredictionSettings_userId_key" ON "PredictionSettings"("userId");

-- AddForeignKey
ALTER TABLE "PredictionSettings" ADD CONSTRAINT "PredictionSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
