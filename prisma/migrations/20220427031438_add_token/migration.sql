-- CreateTable
CREATE TABLE "TwitchToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TwitchToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitchToken_userId_key" ON "TwitchToken"("userId");

-- AddForeignKey
ALTER TABLE "TwitchToken" ADD CONSTRAINT "TwitchToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
