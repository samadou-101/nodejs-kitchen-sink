import { prisma } from "@/config/db.config";
import type { DbClient } from "./order.types";

const getClient = (tx?: DbClient) => tx || prisma;

export const orderRepo = {
  insertOrder: (
    tx: DbClient,
    data: {
      customer: { name: string; email: string; phone: string; address: string };
    },
  ) =>
    getClient(tx).order.create({
      data: {
        orderDate: new Date(),
        status: { connect: { orderStatusId: 1 } },
        customer: { create: data.customer },
      },
    }),

  findOrderById: (tx: DbClient) => (orderId: number) =>
    getClient(tx).order.findUnique({ where: { orderId } }),

  findOrderWithCustomer: (tx: DbClient) => (orderId: number) =>
    getClient(tx).order.findUnique({
      where: { orderId },
      select: { customerId: true },
    }),

  findInventoryByProductIds: (tx: DbClient) => (productIds: number[]) =>
    getClient(tx).inventory.findMany({
      where: { productId: { in: productIds } },
      select: { productId: true, quantityAvailable: true },
    }),

  decrementInventoryBatch:
    (tx: DbClient) => (items: { productId: number; quantity: number }[]) =>
      Promise.all(
        items.map((item) =>
          getClient(tx).inventory.updateMany({
            where: {
              productId: item.productId,
              quantityAvailable: { gte: item.quantity },
            },
            data: { quantityAvailable: { decrement: item.quantity } },
          }),
        ),
      ),

  createOrderItemsBatch:
    (tx: DbClient) =>
    (
      orderId: number,
      items: {
        productId: number;
        quantity: number;
        price: number;
      }[],
    ) =>
      getClient(tx).orderItem.createMany({
        data: items.map((item) => ({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      }),

  replaceOrderItems:
    (tx: DbClient) =>
    async (
      orderId: number,
      items: {
        productId: number;
        quantity: number;
        price: number;
      }[],
    ) => {
      const client = getClient(tx);
      await client.orderItem.deleteMany({ where: { orderId } });
      await client.orderItem.createMany({
        data: items.map((item) => ({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    },

  deleteOrder: (tx: DbClient) => (orderId: number) =>
    getClient(tx).order.delete({ where: { orderId } }),

  updateOrder:
    (tx: DbClient) =>
    async (
      orderId: number,
      data: {
        statusId: number;
        notes: string | null;
        employeeId: number | null;
        customerId: number;
        customer?: {
          name: string;
          email: string;
          phone: string;
          address: string;
        };
      },
    ) => {
      const client = getClient(tx);
      if (data.customer) {
        await client.customer.update({
          where: { customerId: data.customerId },
          data: {
            name: data.customer.name,
            email: data.customer.email,
            phone: data.customer.phone,
            address: data.customer.address,
          },
        });
      }
      return client.order.update({
        where: { orderId },
        data: {
          orderStatusId: data.statusId,
          notes: data.notes,
          employeeId: data.employeeId,
        },
      });
    },

  setOrderStatus: (tx: DbClient) => (orderId: number, statusId: number) =>
    getClient(tx).order.update({
      where: { orderId },
      data: { orderStatusId: statusId },
    }),

  assignEmployee: (tx: DbClient) => (orderId: number, employeeId: number) =>
    getClient(tx).order.update({ where: { orderId }, data: { employeeId } }),

  unassignEmployee: (tx: DbClient) => (orderId: number) =>
    getClient(tx).order.update({
      where: { orderId },
      data: { employeeId: null },
    }),

  incrementInventory: (tx: DbClient) => (productId: number, amount: number) =>
    getClient(tx).inventory.updateMany({
      where: { productId },
      data: { quantityAvailable: { increment: amount } },
    }),

  findOrderItemsByOrderId: (tx: DbClient) => (orderId: number) =>
    getClient(tx).orderItem.findMany({
      where: { orderId },
      select: { productId: true, quantity: true },
    }),

  incrementInventoryBatch:
    (tx: DbClient) => (items: { productId: number; quantity: number }[]) =>
      Promise.all(
        items.map((item) =>
          getClient(tx).inventory.updateMany({
            where: { productId: item.productId },
            data: { quantityAvailable: { increment: item.quantity } },
          }),
        ),
      ),

  findOrders: (tx: DbClient) => async (filter: {
    statusId?: number;
    employeeId?: number;
    page?: number;
    limit?: number;
  }) => {
    const { statusId, employeeId, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;
    const where = {
      ...(statusId ? { orderStatusId: statusId } : {}),
      ...(employeeId ? { employeeId } : {}),
    };
    const [data, total] = await Promise.all([
      getClient(tx).order.findMany({
        where,
        include: {
          customer: true,
          status: true,
          employee: { include: { user: { select: { name: true } } } },
          orderItems: { include: { product: true } },
        },
        orderBy: { orderDate: "desc" },
        skip,
        take: limit,
      }),
      getClient(tx).order.count({ where }),
    ]);
    return { data, total };
  },

  findOrdersByPhone: (tx: DbClient) => (phone: string) =>
    getClient(tx).order.findMany({
      where: { customer: { phone } },
      include: {
        status: true,
        orderItems: { include: { product: true } },
      },
      orderBy: { orderDate: "desc" },
    }),
};

export const bind = (tx: DbClient) => ({
  insertOrder: (data: Parameters<typeof orderRepo.insertOrder>[1]) =>
    orderRepo.insertOrder(tx, data),
  findOrderById: orderRepo.findOrderById(tx),
  findOrderWithCustomer: orderRepo.findOrderWithCustomer(tx),
  findInventoryByProductIds: orderRepo.findInventoryByProductIds(tx),
  decrementInventoryBatch: orderRepo.decrementInventoryBatch(tx),
  createOrderItemsBatch: orderRepo.createOrderItemsBatch(tx),
  replaceOrderItems: orderRepo.replaceOrderItems(tx),
  deleteOrder: orderRepo.deleteOrder(tx),
  updateOrder: orderRepo.updateOrder(tx),
  setOrderStatus: orderRepo.setOrderStatus(tx),
  assignEmployee: orderRepo.assignEmployee(tx),
  unassignEmployee: orderRepo.unassignEmployee(tx),
  incrementInventory: orderRepo.incrementInventory(tx),
  findOrderItemsByOrderId: orderRepo.findOrderItemsByOrderId(tx),
  incrementInventoryBatch: orderRepo.incrementInventoryBatch(tx),
  findOrders: orderRepo.findOrders(tx),
  findOrdersByPhone: orderRepo.findOrdersByPhone(tx),
});
