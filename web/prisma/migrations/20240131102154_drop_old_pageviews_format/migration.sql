/*
  Warnings:

  - You are about to drop the `PageView` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PageVisitor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PageView" DROP CONSTRAINT "PageView_projectId_fkey";

-- DropForeignKey
ALTER TABLE "PageVisitor" DROP CONSTRAINT "PageVisitor_projectId_fkey";

-- DropTable
DROP TABLE "PageView";

-- DropTable
DROP TABLE "PageVisitor";
