-- CreateTable
CREATE TABLE "DonationAlerts" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(16) NOT NULL,

    CONSTRAINT "DonationAlerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DonationAlerts_userId_key" ON "DonationAlerts"("userId");

-- AddForeignKey
ALTER TABLE "DonationAlerts" ADD CONSTRAINT "DonationAlerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
