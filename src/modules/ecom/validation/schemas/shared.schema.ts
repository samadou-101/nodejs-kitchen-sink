import { z } from "zod";

export const IdSchema = z.coerce
  .number()
  .int()
  .positive("ID must be a positive integer");

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const DateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
