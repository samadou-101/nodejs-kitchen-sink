import { prisma } from "@/config/db.config";
import type { CartItem } from "./customer.types";

export type CartItemWithProduct = CartItem & {
  product: {
    productId: number;
    name: string;
    price: number;
    inventory: { quantityAvailable: number } | null;
  };
};

export async function findProductsByIds(productIds: number[]) {
  return prisma.product.findMany({
    where: { productId: { in: productIds } },
    include: { inventory: true },
  });
}

export async function findProductsByCategory(categoryId: number) {
  return prisma.product.findMany({
    where: { categoryId },
    include: { inventory: true },
  });
}

export async function searchProductsByName(query: string) {
  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { inventory: true },
  });
}

export async function getAllProducts(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return prisma.product.findMany({
    include: { inventory: true, category: true },
    skip,
    take: limit,
  });
}

export async function findAllCategories() {
  return prisma.productCategory.findMany({
    include: { _count: { select: { products: true } } },
  });
}

export async function findOrdersByPhone(phone: string) {
  return prisma.order.findMany({
    where: { customer: { phone } },
    include: {
      status: true,
      orderItems: { include: { product: true } },
    },
    orderBy: { orderDate: "desc" },
  });
}

export async function findOrderById(orderId: number) {
  return prisma.order.findUnique({
    where: { orderId },
    include: {
      customer: true,
      status: true,
      orderItems: { include: { product: true } },
    },
  });
}

export async function createOrder(
  customerData: { name: string; phone: string; address: string; city: string },
  items: { productId: number; quantity: number; price: number }[],
  notes: string | null,
) {
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: {
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        email: null,
      },
    });

    const order = await tx.order.create({
      data: {
        orderDate: new Date(),
        customerId: customer.customerId,
        orderStatusId: 1,
        notes,
      },
    });

    if (items.length > 0) {
      await tx.orderItem.createMany({
        data: items.map((item) => ({
          orderId: order.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    }

    return order;
  });
}
