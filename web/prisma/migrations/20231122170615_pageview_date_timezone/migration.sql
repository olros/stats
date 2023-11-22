-- AlterTable to save timestamps with timezone
ALTER TABLE "PageViewNext" ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(3) USING "date" AT TIME ZONE 'Europe/Oslo';
