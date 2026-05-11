import { AppError, NotFoundError } from "@/modules/ecom/shared/errors";

export class OrderNotFoundError extends NotFoundError {
  constructor(orderId: number) {
    super(`Order ${orderId} not found`);
    this.name = "OrderNotFoundError";
  }
}

export class InsufficientStockError extends AppError {
  constructor(productId: number, requested: number, available: number) {
    super(
      `Insufficient stock for product ${productId}: requested ${requested}, available ${available}`,
      400,
      "INSUFFICIENT_STOCK",
    );
    this.name = "InsufficientStockError";
  }
}

export class ProductNotFoundError extends AppError {
  constructor(productId: number) {
    super(`Product ${productId} not found`, 400, "PRODUCT_NOT_FOUND");
    this.name = "ProductNotFoundError";
  }
}
