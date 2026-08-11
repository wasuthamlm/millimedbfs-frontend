-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "seoDesc" TEXT,
ADD COLUMN     "seoNoIndex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seoTitle" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "seoDesc" TEXT,
ADD COLUMN     "seoNoIndex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seoTitle" TEXT;
