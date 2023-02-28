-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "public_statistics" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "track_page_visitors" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "PageVisitor" (
    "projectId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "hashed_user_id" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "PageVisitor_pkey" PRIMARY KEY ("projectId","date","hashed_user_id")
);

-- AddForeignKey
ALTER TABLE "PageVisitor" ADD CONSTRAINT "PageVisitor_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
