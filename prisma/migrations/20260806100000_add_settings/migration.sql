-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('OPENAI', 'GEMINI');

-- AlterTable
ALTER TABLE "FooterContact" ADD COLUMN     "addressEn" TEXT,
ADD COLUMN     "companyNameEn" TEXT,
ADD COLUMN     "companyNameTh" TEXT,
ADD COLUMN     "googleMapsEmbedUrl" TEXT,
ADD COLUMN     "lineId" TEXT,
ADD COLUMN     "taglineEn" TEXT,
ADD COLUMN     "taxId" TEXT;

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "siteNameTh" TEXT,
    "siteNameEn" TEXT,
    "siteUrl" TEXT,
    "youtubeEmbedUrl" TEXT,
    "gtmId" TEXT,
    "ga4Id" TEXT,
    "fbPixelId" TEXT,
    "tiktokPixelId" TEXT,
    "seoMetaTitleTh" TEXT,
    "seoMetaDescTh" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "youtubeUrl" TEXT,
    "tiktokUrl" TEXT,
    "lineUrl" TEXT,
    "socialIconStyle" TEXT NOT NULL DEFAULT 'circle-outline',
    "showSocialInHeader" BOOLEAN NOT NULL DEFAULT false,
    "siteLogoId" TEXT,
    "faviconId" TEXT,
    "loginBgId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalTheme" (
    "id" TEXT NOT NULL,
    "fontHeader" TEXT NOT NULL DEFAULT 'Prompt',
    "fontBody" TEXT NOT NULL DEFAULT 'Sarabun',
    "colorPrimary" TEXT NOT NULL DEFAULT '#032f87',
    "colorPrimaryHover" TEXT NOT NULL DEFAULT '#ffe45c',
    "colorAccent" TEXT NOT NULL DEFAULT '#fed22f',
    "colorBackground" TEXT NOT NULL DEFAULT '#dfedfb',
    "colorText" TEXT NOT NULL DEFAULT '#121212',
    "buttonRadius" TEXT NOT NULL DEFAULT 'soft-sm',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSettings" (
    "id" TEXT NOT NULL,
    "provider" "AiProvider" NOT NULL DEFAULT 'GEMINI',
    "model" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_siteLogoId_fkey" FOREIGN KEY ("siteLogoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_faviconId_fkey" FOREIGN KEY ("faviconId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_loginBgId_fkey" FOREIGN KEY ("loginBgId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

