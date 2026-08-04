/*
  Warnings:

  - You are about to drop the `ContentPage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContentPage" DROP CONSTRAINT "ContentPage_coverImageId_fkey";

-- DropTable
DROP TABLE "ContentPage";
