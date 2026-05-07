/*
  Warnings:

  - You are about to drop the `EmployeePaymentPerOrderRate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EmployeePaymentPerOrderRate" DROP CONSTRAINT "EmployeePaymentPerOrderRate_employeeId_fkey";

-- AlterTable
ALTER TABLE "EmployeePayment" ADD COLUMN     "contractId" INTEGER;

-- DropTable
DROP TABLE "EmployeePaymentPerOrderRate";

-- CreateTable
CREATE TABLE "EmployeePaymentContract" (
    "contractId" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "paymentTypeId" INTEGER NOT NULL,
    "salaryAmount" INTEGER,
    "perOrderRate" INTEGER,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EmployeePaymentContract_pkey" PRIMARY KEY ("contractId")
);

-- CreateIndex
CREATE INDEX "EmployeePaymentContract_employeeId_isActive_idx" ON "EmployeePaymentContract"("employeeId", "isActive");

-- AddForeignKey
ALTER TABLE "EmployeePaymentContract" ADD CONSTRAINT "EmployeePaymentContract_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePaymentContract" ADD CONSTRAINT "EmployeePaymentContract_paymentTypeId_fkey" FOREIGN KEY ("paymentTypeId") REFERENCES "EmployeePaymentType"("paymentTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePayment" ADD CONSTRAINT "EmployeePayment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "EmployeePaymentContract"("contractId") ON DELETE SET NULL ON UPDATE CASCADE;
