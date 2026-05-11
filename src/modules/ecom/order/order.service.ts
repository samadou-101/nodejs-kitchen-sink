import { prisma } from "@/config/db.config";
import { bind } from "./order.repo";
import type { OrderData, OrderItem } from "./order.types";
import {
  OrderNotFoundError,
  InsufficientStockError,
  ProductNotFoundError,
} from "./order.errors";
import { authorize } from "@/modules/ecom/auth";
import { OrderPolicies, ProductPolicies } from "@/modules/ecom/auth/policies";
import type { OrderContext } from "@/modules/ecom/auth/policies";
import { assertAuth } from "@/modules/ecom/auth/errors";

function toOrderContext(order: { orderId: number; employeeId: number | null; customerId: number }): OrderContext {
  return {
    orderId: order.orderId,
    employeeId: order.employeeId,
    customerId: order.customerId,
  };
}

async function checkAndDecrementInventory(
  orderItems: OrderItem[],
  db: ReturnType<typeof bind>,
) {
  const productIds = orderItems.map((i) => i.productId);
  const inventory = await db.findInventoryByProductIds(productIds);
  const inventoryMap = new Map(
    inventory.map((i) => [i.productId, i.quantityAvailable]),
  );

  const insufficient: {
    productId: number;
    requested: number;
    available: number;
  }[] = [];
  const toDecrement: { productId: number; quantity: number }[] = [];

  for (const item of orderItems) {
    const available = inventoryMap.get(item.productId) ?? 0;
    if (available < item.quantity) {
      insufficient.push({
        productId: item.productId,
        requested: item.quantity,
        available,
      });
    } else {
      toDecrement.push({ productId: item.productId, quantity: item.quantity });
    }
  }

  if (insufficient.length > 0) {
    const first = insufficient[0]!;
    throw new InsufficientStockError(
      first.productId,
      first.requested,
      first.available,
    );
  }

  const results = await db.decrementInventoryBatch(toDecrement);
  for (let i = 0; i < results.length; i++) {
    if (results[i]!.count === 0) {
      const item = toDecrement[i]!;
      const current = inventoryMap.get(item.productId) ?? 0;
      throw new InsufficientStockError(item.productId, item.quantity, current);
    }
  }
}

export async function placeOrder(orderData: OrderData, auth: unknown) {
  assertAuth(auth);
  authorize(auth, OrderPolicies.create());

  return await prisma.$transaction(async (tx) => {
    const db = bind(tx);
    const order = await db.insertOrder(orderData);

    if (orderData.orderItems?.length) {
      await db.createOrderItemsBatch(order.orderId, orderData.orderItems);
    }

    return order;
  });
}

export async function getOrderById(orderId: number, auth: unknown) {
  assertAuth(auth);

  return await prisma.$transaction(async (tx) => {
    const db = bind(tx);

    const order = await db.findOrderById(orderId);
    if (!order) return null;

    authorize(auth, OrderPolicies.view(toOrderContext(order)));

    return order;
  });
}

export async function updateOrder(orderData: OrderData, auth: unknown) {
  assertAuth(auth);
  if (!orderData.orderId) throw new Error("Order ID required");

  return await prisma.$transaction(async (tx) => {
    const db = bind(tx);

    const existing = await db.findOrderById(orderData.orderId);
    if (!existing) {
      throw new OrderNotFoundError(orderData.orderId);
    }

    authorize(auth, OrderPolicies.update(toOrderContext(existing)));

    const updated = await db.updateOrder(orderData.orderId, {
      statusId: orderData.orderStatusId,
      notes: orderData.notes ?? null,
      employeeId: orderData.employeeId,
      customerId: existing.customerId,
      customer: orderData.customer,
    });

    if (orderData.orderItems?.length) {
      await db.replaceOrderItems(orderData.orderId, orderData.orderItems);
    }

    return updated;
  });
}

export async function updateOrderItems(
  orderId: number,
  orderItems: OrderItem[],
  auth: unknown,
) {
  assertAuth(auth);

  return await prisma.$transaction(async (tx) => {
    const db = bind(tx);
    const order = await db.findOrderById(orderId);
    if (!order) throw new OrderNotFoundError(orderId);

    authorize(auth, OrderPolicies.update(toOrderContext(order)));
    return await db.replaceOrderItems(orderId, orderItems);
  });
}

export async function deleteOrderById(orderId: number, auth: unknown) {
  assertAuth(auth);

  return await prisma.$transaction(async (tx) => {
    const db = bind(tx);
    const order = await db.findOrderById(orderId);
    if (!order) throw new OrderNotFoundError(orderId);

    authorize(auth, OrderPolicies.delete());
    return await db.deleteOrder(orderId);
  });
}

export async function assignOrderToEmployee(
  orderId: number,
  employeeId: number,
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, OrderPolicies.assign());

  return await prisma.$transaction(async (tx) => {
    const db = bind(tx);
    return await db.assignEmployee(orderId, employeeId);
  });
}

export async function unassignEmployeeFromOrder(
  orderId: number,
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, OrderPolicies.assign());

  return await prisma.$transaction(async (tx) => {
    const db = bind(tx);
    return await db.unassignEmployee(orderId);
  });
}

export async function updateOrderStatus(
  orderId: number,
  statusId: number,
  auth: unknown,
) {
  assertAuth(auth);

  try {
    return await prisma.$transaction(async (tx) => {
      const db = bind(tx);

      const order = await db.findOrderById(orderId);
      if (!order) {
        throw new OrderNotFoundError(orderId);
      }

      authorize(auth, OrderPolicies.confirm(toOrderContext(order)));

      const previousStatusId = order.orderStatusId;
      const isConfirming = previousStatusId !== 2 && statusId === 2;
      const isCancellingConfirmed = previousStatusId === 2 && statusId === 3;

      if (isConfirming) {
        const orderItems = await db.findOrderItemsByOrderId(orderId);
        if (orderItems.length > 0) {
          await checkAndDecrementInventory(
            orderItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: 0,
            })),
            db,
          );
        }
      }

      if (isCancellingConfirmed) {
        const orderItems = await db.findOrderItemsByOrderId(orderId);
        if (orderItems.length > 0) {
          await db.incrementInventoryBatch(
            orderItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
          );
        }
      }

      return db.setOrderStatus(orderId, statusId);
    });
  } catch (error) {
    console.error("[updateOrderStatus] Error:", error);
    throw error;
  }
}

export async function updateInventory(
  productId: number,
  action: "increase" | "decrease",
  amount: number,
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, ProductPolicies.updateInventory());

  const db = bind(prisma);

  if (action === "decrease") {
    const results = await db.decrementInventoryBatch([
      { productId, quantity: amount },
    ]);
    const result = results[0];
    if (!result || result.count === 0) {
      const inventory = await prisma.inventory.findUnique({
        where: { productId },
      });
      if (!inventory) throw new ProductNotFoundError(productId);
      throw new InsufficientStockError(
        productId,
        amount,
        inventory.quantityAvailable,
      );
    }
    return result;
  }

  const result2 = await db.incrementInventory(productId, amount);
  if (result2.count === 0) throw new ProductNotFoundError(productId);
  return result2;
}

export async function listOrders(
  filter: {
    statusId?: number;
    employeeId?: number;
    page?: number;
    limit?: number;
  },
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, OrderPolicies.viewAll());
  return await bind(prisma).findOrders(filter);
}

export async function trackOrdersByPhone(phone: string) {
  return await bind(prisma).findOrdersByPhone(phone);
}