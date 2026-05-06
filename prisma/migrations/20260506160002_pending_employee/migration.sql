-- CreateTable
CREATE TABLE "PendingEmployee" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "isPending" BOOLEAN NOT NULL,

    CONSTRAINT "PendingEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingEmployee_email_key" ON "PendingEmployee"("email");
