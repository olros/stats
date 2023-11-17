/*
  Warnings:

  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PageViewNext` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PageViewNext" DROP CONSTRAINT "PageViewNext_locationId_fkey";

-- DropForeignKey
ALTER TABLE "PageViewNext" DROP CONSTRAINT "PageViewNext_projectId_fkey";

-- DropTable
DROP TABLE "Location";

-- DropTable
DROP TABLE "PageViewNext";
