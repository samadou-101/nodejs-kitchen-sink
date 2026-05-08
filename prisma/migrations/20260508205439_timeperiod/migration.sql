/*
  Warnings:

  - You are about to drop the column `paymentPeriod` on the `EmployeePayment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmployeePayment" DROP COLUMN "paymentPeriod",
ADD COLUMN     "paymentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "paymentPeriodLabel" TEXT,
ADD COLUMN     "paymentPeriodStart" TIMESTAMP(3);
