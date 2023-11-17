-- CreateTable
CREATE TABLE "PageViewNext" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "pathname" TEXT NOT NULL,
    "user_hash" TEXT NOT NULL,
    "referrer" TEXT,
    "browser" TEXT,
    "device" TEXT,
    "os" TEXT,
    "locationId" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "PageViewNext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "flag" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_flag_country_city_key" ON "Location"("flag", "country", "city");

-- AddForeignKey
ALTER TABLE "PageViewNext" ADD CONSTRAINT "PageViewNext_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageViewNext" ADD CONSTRAINT "PageViewNext_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
