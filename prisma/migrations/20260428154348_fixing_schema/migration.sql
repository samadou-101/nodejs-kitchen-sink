/*
  Warnings:

  - You are about to drop the `PasswodRsetTokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PasswodRsetTokens" DROP CONSTRAINT "PasswodRsetTokens_userId_fkey";

-- DropTable
DROP TABLE "PasswodRsetTokens";

-- CreateTable
CREATE TABLE "PasswodResetTokens" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "PasswodResetTokens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PasswodResetTokens" ADD CONSTRAINT "PasswodResetTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
