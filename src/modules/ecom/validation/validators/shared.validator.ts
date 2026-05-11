import {
  IdSchema,
  PaginationSchema,
  DateRangeSchema,
} from "../schemas/shared.schema";

export function validateId(id: unknown): number {
  return IdSchema.parse(id);
}

export function validatePagination(data: unknown): {
  page: number;
  limit: number;
} {
  const pagination = PaginationSchema.parse(data);
  return { page: pagination.page ?? 1, limit: pagination.limit ?? 20 };
}

export function validateDateRange(data: unknown): {
  startDate: Date;
  endDate: Date;
} {
  return DateRangeSchema.parse(data);
}
