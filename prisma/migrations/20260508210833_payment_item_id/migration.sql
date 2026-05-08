/*
  Warnings:

  - You are about to drop the column `status` on the `PayrollRunItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PayrollRunItem" DROP COLUMN "status",
ADD COLUMN     "calculationStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID';
