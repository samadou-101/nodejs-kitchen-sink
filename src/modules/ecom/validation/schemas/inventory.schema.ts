import { z } from "zod";

export const ProductIdSchema = z.number().int().positive("Product ID must be a positive integer");

export const InventoryAdjustDataSchema = z.object({
  productId: ProductIdSchema,
  action: z.enum(["increase", "decrease"], { message: "Action must be 'increase' or 'decrease'" }),
  amount: z.number().positive("Amount must be positive"),
});

export type InventoryAdjustData = z.infer<typeof InventoryAdjustDataSchema>;

export const ThresholdSchema = z.coerce.number().int().positive("Threshold must be a positive integer");
