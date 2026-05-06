-- DropForeignKey
ALTER TABLE "PendingAdmin" DROP CONSTRAINT "PendingAdmin_email_fkey";

-- AlterTable
ALTER TABLE "PendingAdmin" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "PendingAdmin" ADD CONSTRAINT "PendingAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
