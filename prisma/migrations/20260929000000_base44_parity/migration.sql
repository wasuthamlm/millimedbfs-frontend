-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterEnum
ALTER TYPE "AiProvider" ADD VALUE 'ANTHROPIC';

-- AlterEnum
ALTER TYPE "PostStatus" ADD VALUE 'ARCHIVED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SectionType" ADD VALUE 'TEXT';
ALTER TYPE "SectionType" ADD VALUE 'COLUMNS';
ALTER TYPE "SectionType" ADD VALUE 'TEXT_IMAGE';
ALTER TYPE "SectionType" ADD VALUE 'VIDEO';
ALTER TYPE "SectionType" ADD VALUE 'GALLERY';
ALTER TYPE "SectionType" ADD VALUE 'CTA';
ALTER TYPE "SectionType" ADD VALUE 'LAYOUT';
ALTER TYPE "SectionType" ADD VALUE 'DATA_PRODUCTS';
ALTER TYPE "SectionType" ADD VALUE 'DATA_ARTICLES';
ALTER TYPE "SectionType" ADD VALUE 'DOWNLOAD';
ALTER TYPE "SectionType" ADD VALUE 'CONTACT_INFO';
ALTER TYPE "SectionType" ADD VALUE 'ABOUT_TEASER';
ALTER TYPE "SectionType" ADD VALUE 'YOUTUBE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TranslatableEntity" ADD VALUE 'PAGE';
ALTER TYPE "TranslatableEntity" ADD VALUE 'PAGE_SECTION';
ALTER TYPE "TranslatableEntity" ADD VALUE 'NAV_LINK';
ALTER TYPE "TranslatableEntity" ADD VALUE 'POPUP';
ALTER TYPE "TranslatableEntity" ADD VALUE 'WIDGET';
ALTER TYPE "TranslatableEntity" ADD VALUE 'LANDING_PAGE';
ALTER TYPE "TranslatableEntity" ADD VALUE 'PRODUCT_CATEGORY';
ALTER TYPE "TranslatableEntity" ADD VALUE 'ARTICLE_CATEGORY';
ALTER TYPE "TranslatableEntity" ADD VALUE 'BANNER';
ALTER TYPE "TranslatableEntity" ADD VALUE 'FOOTER';

-- AlterTable
ALTER TABLE "ArticleCategory" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "descriptionTh" TEXT,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "mediaType" TEXT NOT NULL DEFAULT 'image',
ADD COLUMN     "posterUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "customFields" JSONB,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "GlobalTheme" ADD COLUMN     "fontBodyCustom" TEXT,
ADD COLUMN     "fontHeaderCustom" TEXT;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "altEn" TEXT,
ADD COLUMN     "altTh" TEXT,
ADD COLUMN     "captionEn" TEXT,
ADD COLUMN     "captionTh" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "MediaFolder" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "NavLink" ADD COLUMN     "openInNewTab" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "heroAlignment" TEXT,
ADD COLUMN     "heroStyle" TEXT,
ADD COLUMN     "marketingEligible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ogDesc" TEXT,
ADD COLUMN     "ogDescEn" TEXT,
ADD COLUMN     "ogImageUrl" TEXT,
ADD COLUMN     "ogTitle" TEXT,
ADD COLUMN     "ogTitleEn" TEXT,
ADD COLUMN     "schemaCustom" JSONB;

-- AlterTable
ALTER TABLE "PageSection" ADD COLUMN     "bodyEn" TEXT,
ADD COLUMN     "customLabel" TEXT,
ADD COLUMN     "landingPageId" TEXT,
ALTER COLUMN "pageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedPrevStatus" TEXT,
ADD COLUMN     "faq" JSONB,
ADD COLUMN     "focusKeyword" TEXT,
ADD COLUMN     "marketingEligible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ogDesc" TEXT,
ADD COLUMN     "ogDescEn" TEXT,
ADD COLUMN     "ogImageUrl" TEXT,
ADD COLUMN     "ogTitle" TEXT,
ADD COLUMN     "ogTitleEn" TEXT,
ADD COLUMN     "relatedPostIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "relatedProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "schemaArticle" JSONB,
ADD COLUMN     "secondaryKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedPrevStatus" TEXT,
ADD COLUMN     "focusKeyword" TEXT,
ADD COLUMN     "marketingEligible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ogDesc" TEXT,
ADD COLUMN     "ogDescEn" TEXT,
ADD COLUMN     "ogImageUrl" TEXT,
ADD COLUMN     "ogTitle" TEXT,
ADD COLUMN     "ogTitleEn" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "secondaryKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "shortDescEn" TEXT,
ADD COLUMN     "shortDescTh" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "subCategoryId" TEXT,
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "descriptionTh" TEXT,
ADD COLUMN     "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "SiteBannerConfig" ADD COLUMN     "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "Widget" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#1B5E4B',
ADD COLUMN     "design" TEXT NOT NULL DEFAULT 'pill',
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "labelEn" TEXT,
ADD COLUMN     "labelTh" TEXT,
ADD COLUMN     "openInNewTab" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "position" TEXT NOT NULL DEFAULT 'bottom-right',
ADD COLUMN     "type" TEXT;

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Popup" (
    "id" TEXT NOT NULL,
    "titleTh" TEXT,
    "titleEn" TEXT,
    "bodyTh" TEXT,
    "bodyEn" TEXT,
    "imageUrl" TEXT,
    "buttonLabelTh" TEXT,
    "buttonLabelEn" TEXT,
    "link" TEXT,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "layout" TEXT NOT NULL DEFAULT 'image-top',
    "animation" TEXT NOT NULL DEFAULT 'zoom',
    "size" TEXT NOT NULL DEFAULT 'md',
    "delaySeconds" INTEGER NOT NULL DEFAULT 1,
    "frequency" TEXT NOT NULL DEFAULT 'once_per_session',
    "homeOnly" BOOLEAN NOT NULL DEFAULT true,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Popup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "code" TEXT NOT NULL,
    "labelLocal" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "SiteConfig" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorEmail" TEXT NOT NULL,
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "targetLabel" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAccess" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleTh" TEXT NOT NULL,
    "titleEn" TEXT,
    "coverImageUrl" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "primaryColor" TEXT NOT NULL DEFAULT '#032f87',
    "accentColor" TEXT NOT NULL DEFAULT '#B8860B',
    "bgColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "textColor" TEXT NOT NULL DEFAULT '#121212',
    "useSiteColors" BOOLEAN NOT NULL DEFAULT true,
    "headerConfig" JSONB,
    "footerConfig" JSONB,
    "widgetConfig" JSONB,
    "seoTitle" TEXT,
    "seoTitleEn" TEXT,
    "seoDesc" TEXT,
    "seoDescEn" TEXT,
    "ogTitle" TEXT,
    "ogTitleEn" TEXT,
    "ogDesc" TEXT,
    "ogDescEn" TEXT,
    "ogImageUrl" TEXT,
    "focusKeyword" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "faq" JSONB,
    "geoPlaceName" TEXT,
    "geoAddress" TEXT,
    "geoLatitude" TEXT,
    "geoLongitude" TEXT,
    "marketingEligible" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductImage_productId_order_idx" ON "ProductImage"("productId", "order");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_targetType_targetId_idx" ON "ActivityLog"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccess_email_key" ON "AdminAccess"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LandingPage_slug_key" ON "LandingPage"("slug");

-- CreateIndex
CREATE INDEX "PageSection_landingPageId_order_idx" ON "PageSection"("landingPageId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCategory" ADD CONSTRAINT "ArticleCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ArticleCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageSection" ADD CONSTRAINT "PageSection_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "LandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ───────── Data backfill (additive only) ─────────

-- Product URL slugs: the Base44 importer stored the legacy slug in sku.
UPDATE "Product" SET "slug" = "sku" WHERE "slug" IS NULL;

-- Site languages, matching the live legacy site's enabled set.
INSERT INTO "Language" ("code", "labelLocal", "enabled", "order") VALUES
  ('th', 'ไทย', true, 0),
  ('en', 'English', true, 1),
  ('zh', '中文', true, 2),
  ('ko', '한국어', true, 3),
  ('ja', '日本語', true, 4),
  ('my', 'မြန်မာ', false, 5),
  ('lo', 'ລາວ', false, 6),
  ('vi', 'Tiếng Việt', false, 7),
  ('ms', 'Bahasa Melayu', false, 8)
ON CONFLICT ("code") DO NOTHING;

-- Carry the PopupConfig singleton over to the new multi-popup table. PopupConfig
-- itself is left in place. homeOnly=false keeps today's show-on-every-page behaviour.
INSERT INTO "Popup" ("id", "titleTh", "imageUrl", "link", "frequency", "homeOnly", "status", "active", "startDate", "endDate", "createdAt", "updatedAt")
SELECT pc."id", pc."titleTh", m."url", pc."link",
  CASE pc."frequency"
    WHEN 'every-visit' THEN 'always'
    WHEN 'once-per-day' THEN 'once_per_day'
    ELSE 'once_per_session'
  END,
  false,
  CASE WHEN pc."enabled" THEN 'PUBLISHED'::"PublishStatus" ELSE 'DRAFT'::"PublishStatus" END,
  pc."enabled", pc."startDate", pc."endDate", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "PopupConfig" pc
LEFT JOIN "Media" m ON m."id" = pc."imageId"
ON CONFLICT ("id") DO NOTHING;
