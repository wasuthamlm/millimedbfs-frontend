-- CreateTable
CREATE TABLE "FooterConfig" (
    "id" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL DEFAULT '#032f87',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "accentColor" TEXT NOT NULL DEFAULT '#fed22f',
    "desktopColumns" INTEGER NOT NULL DEFAULT 3,
    "copyrightTh" TEXT,
    "copyrightEn" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterConfig_pkey" PRIMARY KEY ("id")
);
