import {
  findProductsByIds,
  findProductsByCategory,
  searchProductsByName,
  getAllProducts,
  findAllCategories,
  findOrdersByPhone,
  findOrderById,
  createOrder,
} from "./customer.repo";
import type { CartItem, CheckoutData } from "./customer.types";

export async function browseProducts(page = 1, limit = 20) {
  return await getAllProducts(page, limit);
}

export async function filterByCategory(categoryId: number) {
  return await findProductsByCategory(categoryId);
}

export async function searchProducts(query: string) {
  return await searchProductsByName(query);
}

export async function getProductById(productId: number) {
  return await findProductsByIds([productId]);
}

export async function getCategories() {
  return await findAllCategories();
}

export async function checkout(data: CheckoutData) {
  const products = await findProductsByIds(data.items.map((i) => i.productId));
  const productMap = new Map(products.map((p) => [p.productId, p]));

  const insufficient: string[] = [];
  const orderItems: { productId: number; quantity: number; price: number }[] = [];

  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      insufficient.push(`Product ${item.productId} not found`);
      continue;
    }
    const available = product.inventory?.quantityAvailable ?? 0;
    if (available < item.quantity) {
      insufficient.push(`${product.name}: requested ${item.quantity}, available ${available}`);
      continue;
    }
    orderItems.push({
      productId: product.productId,
      quantity: item.quantity,
      price: product.price,
    });
  }

  if (insufficient.length > 0) {
    throw new Error(`Insufficient stock: ${insufficient.join("; ")}`);
  }

  return await createOrder(
    {
      name: data.name,
      phone: data.phone,
      address: data.address,
      city: data.city,
    },
    orderItems,
    data.notes ?? null,
  );
}

export async function trackOrders(phone: string) {
  return await findOrdersByPhone(phone);
}

export async function getOrderForTracking(orderId: number) {
  return await findOrderById(orderId);
}
