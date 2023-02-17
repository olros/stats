-- CreateTable
CREATE TABLE "PageView" (
    "projectId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "hour" INTEGER NOT NULL,
    "pathname" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "mobile_count" INTEGER NOT NULL,
    "tablet_count" INTEGER NOT NULL,
    "dekstop_count" INTEGER NOT NULL,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("projectId","date","hour","pathname")
);

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
