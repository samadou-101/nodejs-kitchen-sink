/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `PendingAdmin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `PendingAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PendingAdmin" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PendingAdmin_email_key" ON "PendingAdmin"("email");
