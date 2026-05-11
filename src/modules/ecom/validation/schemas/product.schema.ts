import { z } from "zod";

export const CategoryDataSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  name: z.string().min(1, "Category name is required").max(255),
  description: z.string().max(1000).optional(),
});

export type CategoryData = z.infer<typeof CategoryDataSchema>;

export const ProductDataSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().max(1000).optional(),
  price: z.number().positive("Price must be positive"),
  categoryId: z.number().int().positive("Category ID must be a positive integer"),
  initialStock: z.number().int().min(0).optional(),
});

export type ProductData = z.infer<typeof ProductDataSchema>;

export const ProductFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z
    .coerce.number()
    .int()
    .positive()
    .optional(),
  page: z
    .coerce.number()
    .int()
    .positive()
    .optional()
    .default(1),
  limit: z
    .coerce.number()
    .int()
    .positive()
    .max(100, "Limit cannot exceed 100")
    .optional()
    .default(20),
});

export type ProductFilter = z.infer<typeof ProductFilterSchema>;