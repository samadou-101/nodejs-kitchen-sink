import { prisma } from "@/config/db.config";
import type { DbClient } from "@/modules/ecom/employee/employee.types";

const getClient = (tx?: DbClient) => tx || prisma;

export const employeeOrderRepo = {
  findAssignedOrders: (tx: DbClient) => (employeeId: number) =>
    getClient(tx).order.findMany({
      where: { employeeId },
      include: {
        customer: true,
        orderItems: {
          include: { product: true },
        },
        status: true,
      },
      orderBy: { orderDate: "desc" },
    }),

  findOrderById: (tx: DbClient) => (orderId: number) =>
    getClient(tx).order.findUnique({
      where: { orderId },
      include: {
        customer: true,
        orderItems: { include: { product: true } },
        status: true,
      },
    }),

  updateOrderNotes: (tx: DbClient) => (orderId: number, notes: string | null) =>
    getClient(tx).order.update({
      where: { orderId },
      data: { notes },
    }),
};

export const bind = (tx: DbClient) => ({
  findAssignedOrders: employeeOrderRepo.findAssignedOrders(tx),
  findOrderById: employeeOrderRepo.findOrderById(tx),
  updateOrderNotes: employeeOrderRepo.updateOrderNotes(tx),
});
