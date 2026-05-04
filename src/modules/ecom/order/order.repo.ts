import { prisma } from "@/config/db.config";
import type { OrderData } from "./order.types";

export async function insertOrder(orderData: OrderData) {
  return await prisma.order.create({
    data: {
      orderDate: new Date(Date.now()),
      status: {
        connect: {
          orderStatusId: 1,
        },
      },
      customer: {
        create: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          phone: orderData.customer.phone,
          address: orderData.customer.address,
        },
      },
    },
  });
}
