/*
  Warnings:

  - A unique constraint covering the columns `[refundId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "basePrice" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "gstAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "refundAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "refundId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_refundId_key" ON "Booking"("refundId");
