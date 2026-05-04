-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderStatus" ALTER COLUMN "orderStatusId" SET DEFAULT 1,
ALTER COLUMN "orderStatusId" DROP DEFAULT;
DROP SEQUENCE "OrderStatus_orderStatusId_seq";
