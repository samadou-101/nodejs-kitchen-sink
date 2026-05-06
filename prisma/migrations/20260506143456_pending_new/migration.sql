/*
  Warnings:

  - You are about to drop the column `userId` on the `PendingAdmin` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PendingAdmin" DROP CONSTRAINT "PendingAdmin_userId_fkey";

-- AlterTable
ALTER TABLE "PendingAdmin" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "PendingAdmin" ADD CONSTRAINT "PendingAdmin_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
