-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "seoDescEn" TEXT,
ADD COLUMN     "seoNoIndex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seoTitleEn" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "seoDescEn" TEXT,
ADD COLUMN     "seoTitleEn" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "seoDescEn" TEXT,
ADD COLUMN     "seoTitleEn" TEXT;
