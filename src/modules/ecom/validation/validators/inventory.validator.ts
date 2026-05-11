import { z } from "zod";
import {
  InventoryAdjustDataSchema,
  ThresholdSchema,
  type InventoryAdjustData,
} from "../schemas/inventory.schema";

export function validateInventoryAdjust(data: unknown): InventoryAdjustData {
  return InventoryAdjustDataSchema.parse(data);
}

export function validateThreshold(threshold: unknown): number | undefined {
  if (threshold === undefined || threshold === null) return undefined;
  return ThresholdSchema.parse(threshold);
}
