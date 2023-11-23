/*
  Warnings:

  - You are about to drop the column `device_size` on the `PageViewNext` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PageViewNext" DROP COLUMN "device_size";

-- CreateIndex
CREATE INDEX "PageViewNext_date_idx" ON "PageViewNext" USING BRIN ("date");
