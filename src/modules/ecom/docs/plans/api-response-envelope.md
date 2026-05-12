# API Response Envelope — Standardization Plan

> Standardize all API responses in the ecom module into a consistent `{ success, data, error, meta }` envelope.
> Implements [Tier 2 gap](/plans/production-gaps.md) from the production gaps analysis.

---

## Anchor (last updated: Batch 6 Complete)

**Done:**
- Batch 1 — Created `src/modules/ecom/shared/` (response types, helpers, error classes, error middleware, barrel exports); rewired `auth/errors.ts` and `order/order.errors.ts`; wired error middleware in `app.ts`; deleted empty utils files
- Batch 2 — Refactored `admin/controllers/auth.controller.ts` and `employee/controllers/auth.controller.ts`
- Batch 3 — Refactored `product/product.controller.ts` and `admin/controllers/inventory.controller.ts`
- Batch 4 — Refactored `customer/customer.controller.ts` and `employee/controllers/order.controller.ts`
- Batch 5 — Refactored `order/order.controller.ts`; deleted orphaned `order.utils.ts`, `validation/utils.ts`, cleaned up `validation/index.ts`
- Batch 6 — Refactored `admin/controllers/employee.controller.ts`; removed `handleAuthError`, inline ZodError checks, console.error calls; replaced all response calls with envelope helpers; added `NextFunction` signature and route-not-found fallback

**All controllers now follow a consistent pattern:**
- `NextFunction` in handler signature; errors delegated via `next(error)`
- No inline `handleAuthError`, `handleValidationError`, `handleError`, or `instanceof z.ZodError` checks (all moved to global middleware)
- Success responses use `sendCreated`/`sendSuccess`/`sendNoContent`/`sendError`
- Business-logic failures (e.g., "not found") use `sendError` directly with appropriate status/code

**Next: Batch 7 — Pagination Metadata**

---

## Envelope Contract

```typescript
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: PaginationMeta
}

interface ApiError {
  code: string
  message: string
  details?: unknown
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}
```

### Response Shapes

| Scenario | Status | Body |
|----------|--------|------|
| Success (data) | 200 | `{ success: true, data: { ... } }` |
| Success (action message) | 200 | `{ success: true, data: { message: "Product deleted" } }` |
| Created | 201 | `{ success: true, data: { ... } }` |
| No Content | 204 | *(empty body)* |
| Paginated list | 200 | `{ success: true, data: [...], meta: { page, limit, total, totalPages } }` |
| Validation error | 400 | `{ success: false, error: { code: "VALIDATION_ERROR", message: "...", details: [...] } }` |
| Unauthorized | 401 | `{ success: false, error: { code: "UNAUTHORIZED", message: "..." } }` |
| Forbidden | 403 | `{ success: false, error: { code: "FORBIDDEN", message: "..." } }` |
| Not Found | 404 | `{ success: false, error: { code: "NOT_FOUND", message: "..." } }` |
| Conflict | 409 | `{ success: false, error: { code: "CONFLICT", message: "..." } }` |
| Internal error | 500 | `{ success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } }` |

---

## Batch 1 — Foundation `✅ DONE`

**Created `src/modules/ecom/shared/`:**

| File | Contents |
|------|----------|
| `shared/response.types.ts` | `ApiResponse<T>`, `ApiError`, `PaginationMeta` type definitions |
| `shared/response.ts` | Helper functions: `sendSuccess`, `sendCreated`, `sendNoContent`, `sendPaginated`, `sendError` |
| `shared/errors.ts` | Consolidated error classes — `AppError` (base + `statusCode`), `NotFoundError`(404), `UnauthorizedError`(401), `ForbiddenError`(403), `AuthorizationError`(403), `ValidationError`(400), `ConflictError`(409) |
| `shared/error.middleware.ts` | Global Express error handler — maps error classes to envelope, catches ZodErrors, catches Prisma `P2002` |
| `shared/index.ts` | Barrel exports |

**Integration done:**
- `app.use(errorMiddleware)` added to `src/app.ts`
- `auth/errors.ts` rewritten — imports from shared + re-exports, keeps `assertAuth`/`checkAuthz`
- `order/order.errors.ts` rewritten — `OrderNotFoundError extends NotFoundError`, `InsufficientStockError`/`ProductNotFoundError extend AppError`

**Cleaned up:**
- Deleted empty files: `admin/admin.utils.ts`, `employee/employee.utils.ts`, `product/product.utils.ts`
- *Cleaned up after controller migration:* `validation/utils.ts`, `order/order.utils.ts`

---

## Batch 2 — Auth Controllers `✅ DONE`

**Files to modify:**

### `admin/controllers/auth.controller.ts`
- Remove inline `Prisma.PrismaClientKnownRequestError` handling (moved to middleware)
- `res.status(201).send({ name, email })` → `sendCreated(res, { name, email })`
- `res.status(200).send({ name, email })` → `sendSuccess(res, { name, email })`
- `res.status(400).send("Invalid Data")` → `sendError(res, 400, "VALIDATION_ERROR", "Invalid data")`
- `res.status(400).send("Something went Wrong")` → `sendError(res, 500, "INTERNAL_ERROR", "Something went wrong")`
- Catch block: remove `Prisma` check, delegate to error middleware via `next(error)` or let it throw

### `employee/controllers/auth.controller.ts`
- Same patterns as admin auth controller

---

## Batch 3 — Product & Inventory Controllers `✅ DONE`

**Files to modify:**

### `product/product.controller.ts`
- Remove duplicated `handleAuthError` function (lines 20-30)
- Remove `handleValidationError` import/calls
- `res.status(201).send(product)` → `sendCreated(res, product)`
- `res.status(200).send(updated)` → `sendSuccess(res, updated)`
- `res.status(200).send("Product deleted successfully")` → `sendSuccess(res, { message: "Product deleted successfully" })`
- `res.status(200).send("Category deleted successfully")` → `sendSuccess(res, { message: "Category deleted successfully" })`
- `res.status(400).send("No product found")` → `sendError(res, 404, "NOT_FOUND", "No product found")`
- `res.status(500).send({ error: (error as Error).message })` → let error middleware handle
- `res.status(404).json({ message: "Route not found" })` → `sendError(res, 404, "NOT_FOUND", "Route not found")`

### `admin/controllers/inventory.controller.ts`
- Remove duplicated `handleAuthError` function (lines 13-23)
- `res.status(200).json({ message: "Stock adjusted successfully" })` → `sendSuccess(res, { message: "Stock adjusted successfully" })`
- `res.status(200).json(products)` → `sendSuccess(res, products)`
- `res.status(400).json({ message: (error as Error).message })` → let error middleware handle
- `res.status(500).json({ message: (error as Error).message })` → let error middleware handle
- `res.status(404).json({ message: "Route not found" })` → `sendError(res, 404, "NOT_FOUND", "Route not found")`

---

## Batch 4 — Customer & Employee Order Controllers `✅ DONE`

**Files to modify:**

### `customer/customer.controller.ts`
- Remove all inline `if (error instanceof z.ZodError)` blocks (moved to middleware)
- `res.status(200).json(products)` → `sendSuccess(res, products)`
- `res.status(200).json(categories)` → `sendSuccess(res, categories)`
- `res.status(200).json(order)` → `sendSuccess(res, order)`
- `res.status(200).json(orders)` → `sendSuccess(res, orders)`
- `res.status(201).json({ message: "Order placed successfully", orderId })` → `sendCreated(res, { message: "Order placed successfully", orderId })`
- `res.status(404).json({ message: "Product not found" })` → `sendError(res, 404, "NOT_FOUND", "Product not found")`
- `res.status(404).json({ message: "Order not found" })` → `sendError(res, 404, "NOT_FOUND", "Order not found")`
- `res.status(400).json({ message: error.message })` → let error middleware handle
- `res.status(500).json({ message: error.message })` → let error middleware handle
- `res.status(404).json({ message: "Route not found" })` → `sendError(res, 404, "NOT_FOUND", "Route not found")`

### `employee/controllers/order.controller.ts`
- Remove duplicated `handleAuthError` function (lines 15-25)
- Remove all inline `if (error instanceof z.ZodError)` blocks
- `res.status(200).json(orders)` → `sendSuccess(res, orders)`
- `res.status(200).json(order)` → `sendSuccess(res, order)`
- `res.status(200).json({ message: "Order confirmed", order })` → `sendSuccess(res, { message: "Order confirmed", order })`
- `res.status(200).json({ message: "Order rejected", order })` → `sendSuccess(res, { message: "Order rejected", order })`
- `res.status(200).json({ message: "Notes added", order })` → `sendSuccess(res, { message: "Notes added", order })`
- `res.status(400).json({ message: "employeeId is required" })` → `sendError(res, 400, "VALIDATION_ERROR", "employeeId is required")`
- `res.status(400).json({ message: "Invalid order ID" })` → `sendError(res, 400, "VALIDATION_ERROR", "Invalid order ID")`
- `res.status(404).json({ message: "Order not found" })` → `sendError(res, 404, "NOT_FOUND", "Order not found")`
- `res.status(500).json({ message: (error as Error).message })` → let error middleware handle
- `res.status(404).json({ message: "Route not found" })` → `sendError(res, 404, "NOT_FOUND", "Route not found")`

---

## Batch 5 — Order Controller `✅ DONE`

**Files to modify:**

### `order/order.controller.ts`
- Remove duplicated `handleAuthError` function (lines 25-35)
- Remove `handleError` import from `./order.utils`
- Remove all inline `if (error instanceof z.ZodError)` blocks
- Remove `import { handleError } from "./order.utils"`
- All success responses use appropriate `sendSuccess`/`sendCreated`/`sendNoContent`
- `res.status(204).send()` → `sendNoContent(res)`
- `res.status(404).json({ message: "Order not found" })` → `sendError(res, 404, "NOT_FOUND", "Order not found")`
- `res.status(400).json({ message: "Failed creating order" })` → `sendError(res, 400, "VALIDATION_ERROR", "Failed creating order")`
- Note: `OrderNotFoundError`, `InsufficientStockError`, `ProductNotFoundError` are now subclasses of `AppError` with built-in status codes → error middleware handles them automatically

---

## Batch 6 — Employee Admin Controller (largest, most complex)

**Files to modify:**

### `admin/controllers/employee.controller.ts` (360 lines)
- Remove duplicated `handleAuthError` function (lines 33-43)
- Remove all inline `if (error instanceof z.ZodError)` blocks
- ~30 response calls to replace, all following the same patterns:
  - `res.status(201).send("Employee activated")` → `sendCreated(res, { message: "Employee activated" })`
  - `res.status(201).json({ success: true, employeeId, ... })` → `sendCreated(res, { employeeId, ... })`
  - `res.status(201).json(result)` → `sendCreated(res, result)`
  - `res.status(200).json(runs)` → `sendSuccess(res, runs)`
  - `res.status(200).json(result)` → `sendSuccess(res, result)`
  - `res.status(200).json(perf)` → `sendSuccess(res, perf)`
  - `res.status(404).send("Payroll run not found")` → `sendError(res, 404, "NOT_FOUND", "Payroll run not found")`
  - `res.status(500).send("Something went wrong")` → let error middleware handle
  - Remove both `console.error(error)` calls — middleware will log

---

## Batch 7 — Pagination Metadata

After envelope is live across all endpoints:

### `order/order.controller.ts`
- `listOrders` already accepts `page`/`limit` query params
- Service needs to return `{ data, total }` instead of raw array
- Response: `sendPaginated(res, orders, { page, limit, total, totalPages })`

### Future list endpoints
Same pattern for any new list endpoints added later.

---

## Dependency Graph

```
Batch 1 (Foundation)
  ├── Batch 2 (Auth controllers)
  ├── Batch 3 (Product + Inventory)
  ├── Batch 4 (Customer + Employee Order)
  ├── Batch 5 (Order)
  └── Batch 6 (Employee Admin)
        └── Batch 7 (Pagination)
```

Batches 2–6 are independent of each other and can be done in any order after Batch 1 is complete.

---

## Test Verification

After each batch, verify:
1. Server starts without import errors: `pnpm dev`
2. TypeScript compiles without errors: `npx tsc --noEmit`
3. Smoke-test affected endpoints return the new envelope shape
