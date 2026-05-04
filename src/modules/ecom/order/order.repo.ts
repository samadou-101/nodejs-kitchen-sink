import { prisma } from "@/config/db.config";
import type { OrderData, OrderItem } from "./order.types";

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

export async function findOrderById(orderId: number) {
  return await prisma.order.findFirst({
    where: {
      orderId,
    },
  });
}

export async function updateOrder(orderData: OrderData) {
  const existingOrder = await prisma.order.findUnique({
    where: { orderId: orderData.orderId },
    select: { customerId: true },
  });

  if (!existingOrder) {
    throw new Error(`Order with id ${orderData.orderId} not found`);
  }

  const updatedOrder = await prisma.order.update({
    where: { orderId: orderData.orderId },
    data: {
      status: {
        connect: { orderStatusId: orderData.orderStatusId },
      },
      notes: orderData.notes,
      employee: orderData.employeeId
        ? { connect: { employeeId: orderData.employeeId } }
        : { disconnect: true },
      customer: {
        update: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          phone: orderData.customer.phone,
          address: orderData.customer.address,
        },
      },
    },
  });

  if (orderData.orderItems && orderData.orderItems.length > 0) {
    await updateOrderItems(orderData.orderId, orderData.orderItems);
  }

  return updatedOrder;
}

export async function updateOrderItems(
  orderId: number,
  orderItems: OrderItem[],
) {
  const existingItems = await prisma.orderItem.findMany({
    where: { orderId },
    select: { orderItemId: true, productId: true },
  });

  const existingItemMap = new Map(
    existingItems.map((item) => [item.productId, item.orderItemId]),
  );

  const incomingProductIds = new Set(
    orderItems.filter((item) => item.orderItemId).map((item) => item.productId),
  );

  const itemsToDelete = existingItems.filter(
    (item) => !incomingProductIds.has(item.productId),
  );

  if (itemsToDelete.length > 0) {
    const idsToDelete = itemsToDelete.map((item) => item.orderItemId);
    await prisma.orderItem.deleteMany({
      where: { orderItemId: { in: idsToDelete } },
    });
  }

  for (const item of orderItems) {
    if (item.orderItemId) {
      const existingId = existingItemMap.get(item.productId);
      if (existingId) {
        await prisma.orderItem.update({
          where: { orderItemId: item.orderItemId },
          data: {
            quantity: item.quantity,
            price: item.price,
          },
        });
      } else {
        await prisma.orderItem.create({
          data: {
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }
    } else {
      await prisma.orderItem.create({
        data: {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        },
      });
    }
  }
}

export async function deleteOrder(orderId: number) {
  await prisma.orderItem.deleteMany({
    where: { orderId },
  });

  await prisma.order.delete({
    where: { orderId },
  });
}
