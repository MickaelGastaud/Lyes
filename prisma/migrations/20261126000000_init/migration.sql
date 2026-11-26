-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "MarketListing" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "bodyType" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "fuel" TEXT NOT NULL,
    "gearbox" TEXT NOT NULL,
    "region" TEXT,
    "listedPrice" INTEGER NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ESTIMATED',
    "plate" TEXT,
    "vin" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "bodyType" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "fuel" TEXT NOT NULL,
    "gearbox" TEXT NOT NULL,
    "color" TEXT,
    "powerHp" INTEGER,
    "seats" INTEGER NOT NULL DEFAULT 5,
    "description" TEXT,
    "purchaseCountry" TEXT NOT NULL DEFAULT 'FR',
    "purchasePrice" INTEGER,
    "importCosts" INTEGER NOT NULL DEFAULT 0,
    "reconditioningCosts" INTEGER NOT NULL DEFAULT 0,
    "otherCosts" INTEGER NOT NULL DEFAULT 0,
    "listPrice" INTEGER,
    "soldPrice" INTEGER,
    "warrantyMonths" INTEGER NOT NULL DEFAULT 12,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "checkpoints" TEXT NOT NULL DEFAULT '[]',
    "works" TEXT NOT NULL DEFAULT '[]',
    "purchasedAt" TIMESTAMP(3),
    "listedAt" TIMESTAMP(3),
    "soldAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimation" (
    "id" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "vehicleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Estimation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "vehicleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketListing_make_model_idx" ON "MarketListing"("make", "model");

-- CreateIndex
CREATE INDEX "Vehicle_status_published_idx" ON "Vehicle"("status", "published");

-- AddForeignKey
ALTER TABLE "Estimation" ADD CONSTRAINT "Estimation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

