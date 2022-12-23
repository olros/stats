-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
