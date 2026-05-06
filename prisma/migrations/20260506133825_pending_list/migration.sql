-- CreateTable
CREATE TABLE "PendingAdmin" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "isPending" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PendingAdmin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PendingAdmin" ADD CONSTRAINT "PendingAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
