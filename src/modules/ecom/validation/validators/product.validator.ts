import { z } from "zod";
import {
  CategoryDataSchema,
  ProductDataSchema,
  ProductFilterSchema,
  type CategoryData,
  type ProductData,
  type ProductFilter,
} from "../schemas/product.schema";

export function validateCategoryData(data: unknown): CategoryData {
  return CategoryDataSchema.parse(data);
}

export function validateProductData(data: unknown): ProductData {
  return ProductDataSchema.parse(data);
}

export function validateProductFilter(data: unknown): ProductFilter {
  return ProductFilterSchema.parse(data);
}

export function validateProductId(id: unknown): number {
  return z.coerce.number().int().positive().parse(id);
}

export function validateCategoryId(id: unknown): number {
  return z.coerce.number().int().positive().parse(id);
}