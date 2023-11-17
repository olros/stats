/*
  Warnings:

  - A unique constraint covering the columns `[country,city]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Location_flag_country_city_key";

-- CreateIndex
CREATE UNIQUE INDEX "Location_country_city_key" ON "Location"("country", "city");
