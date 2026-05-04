export class OrderNotFoundError extends Error {
  constructor(orderId: number) {
    super(`Order ${orderId} not found`);
    this.name = "OrderNotFoundError";
  }
}

export class InsufficientStockError extends Error {
  constructor(productId: number, requested: number, available: number) {
    super(`Insufficient stock for product ${productId}: requested ${requested}, available ${available}`);
    this.name = "InsufficientStockError";
  }
}

export class ProductNotFoundError extends Error {
  constructor(productId: number) {
    super(`Product ${productId} not found`);
    this.name = "ProductNotFoundError";
  }
}