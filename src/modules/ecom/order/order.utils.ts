import type { Response } from "express";
import {
  OrderNotFoundError,
  InsufficientStockError,
  ProductNotFoundError,
} from "./order.errors";

export function handleError(res: Response, error: unknown) {
  if (error instanceof OrderNotFoundError) {
    res.status(404).json({ message: error.message });
    return;
  }
  if (error instanceof InsufficientStockError) {
    res.status(400).json({ message: error.message });
    return;
  }
  if (error instanceof ProductNotFoundError) {
    res.status(400).json({ message: error.message });
    return;
  }
  res.status(500).json({ message: "Internal server error" });
}
