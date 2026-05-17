# Error Handling Plan — The `AppError` Hierarchy and Beyond

> Documents the existing error handling architecture, how errors flow from services
> to the client, and a migration plan to fix the inconsistencies found across the ecom module.

---

## 1. The Error Hierarchy

All custom errors live in `src/modules/ecom/shared/errors.ts` and extend the base `AppError` class:

```
Error (native)
└── AppError                    500  INTERNAL_ERROR      (base, extends Error)
    ├── NotFoundError           404  NOT_FOUND
    │   └── OrderNotFoundError  404  NOT_FOUND           (in order/order.errors.ts)
    ├── UnauthorizedError       401  UNAUTHORIZED
    ├── ForbiddenError          403  FORBIDDEN
    ├── AuthorizationError      403  custom code         (takes a code param)
    ├── ValidationError         400  VALIDATION_ERROR     (carries optional `details`)
    └── ConflictError           409  CONFLICT
```

### Base class — `AppError`

```typescript
// src/modules/ecom/shared/errors.ts:1
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}
```

Three properties:
| Property | Type | Purpose |
|----------|------|---------|
| `message` | `string` | Human-readable description (inherited from `Error`) |
| `statusCode` | `number` | HTTP status code sent to the client |
| `code` | `string` | Machine-readable error code (used by API clients to handle errors programmatically) |

### Domain-specific errors

Defined in `src/modules/ecom/order/order.errors.ts`:

```typescript
OrderNotFoundError     → extends NotFoundError,     404, "NOT_FOUND"
InsufficientStockError → extends AppError directly,  400, "INSUFFICIENT_STOCK"
ProductNotFoundError   → extends AppError directly,  400, "PRODUCT_NOT_FOUND"
```

### Auth utilities

Defined in `src/modules/ecom/auth/errors.ts` — re-exports all shared errors plus two helpers:

```typescript
assertAuth(auth): asserts auth is AuthContext
  → throws UnauthorizedError("Authentication required") if falsy

checkAuthz(result: { allowed, reason? }): void
  → throws ForbiddenError(result.reason ?? "Forbidden") if not allowed
```

---

## 2. How Errors Flow Through the System

```
Service                       Controller                 Global Middleware             Client
─────────                     ──────────                 ────────────────              ──────
throw AppError          ──>   catch (error) {       ──>  errorMiddleware(err,    ──>   { success: false,
                              next(error);               req, res, next)                      error: { code,
                              return;                                                         message } }
                              }
```

### Step 1 — Services throw

Services throw `AppError` subclasses (or, inconsistently, plain `Error`):

```typescript
// Consistent (throws AppError subclass):
throw new OrderNotFoundError(orderId);
throw new InsufficientStockError(productId, requested, available);

// Inconsistent (throws plain Error — hits 500 fallback):
throw new Error("Employee not found");
throw new Error("Invalid Credentials");
```

### Step 2 — Controllers catch and forward

Every controller follows the same pattern:

```typescript
// src/modules/ecom/order/order.controller.ts:50
try {
  const result = await orderService.placeOrder(req.body, auth);
  sendCreated(res, result);
} catch (error) {
  next(error);
  return;
}
```

Some controllers bypass the middleware by calling `sendError` directly:

```typescript
// src/modules/ecom/employee/controllers/auth.controller.ts:22
sendError(res, 400, "VALIDATION_ERROR", "Invalid Data");
```

### Step 3 — Global middleware formats the response

Defined in `src/modules/ecom/shared/error.middleware.ts`:

| Error type | Status | Code | Notes |
|-----------|--------|------|-------|
| `AppError` | `err.statusCode` | `err.code` | All custom errors |
| `z.ZodError` | 400 | `VALIDATION_ERROR` | Zod validation failures |
| Prisma `P2002` | 409 | `CONFLICT` | Unique constraint violations |
| Everything else | 500 | `INTERNAL_ERROR` | Fallback — logged to console |

### Step 4 — Response shape

```typescript
// src/modules/ecom/shared/response.types.ts
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
```

On error:

```json
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order 42 not found"
  }
}
```

With validation details:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "code": "invalid_type", "path": ["email"], "message": "Expected string, received number" }
    ]
  }
}
```

---

## 3. Inconsistencies Found

### A. Plain `throw new Error(...)` — 38 occurrences

These hit the 500 fallback in the error middleware, returning `INTERNAL_ERROR` regardless of the actual problem:

| File | Count | Typical problem |
|------|-------|-----------------|
| `admin/services/employee.service.ts` | 15 | "Employee not found", "Payroll run not found", status transitions |
| `employee/services/auth.service.ts` | 5 | "Email not activated", "Invalid Credentials" |
| `admin/services/auth.service.ts` | 4 | "Email not activated", "No Admin found" |
| `employee/services/order.service.ts` | 4 | "Order not found" |
| `product/product.admin.service.ts` | 4 | "Product ID required", "Failed to update product" |
| `admin/repo/inventory.repo.ts` | 2 | Inventory not found |
| `order/order.service.ts` | 1 | "Order ID required" |
| `customer/customer.service.ts` | 1 | "Insufficient stock" |
| `auth/rbac/rbac.repo.ts` | 1 | "Role not found" |
| `docs/plans/testing.md` | 1 | Test mock (intentional) |

**What should happen instead:**

| Message | Should be |
|---------|-----------|
| "Employee not found" | `NotFoundError` (404) |
| "Payroll run not found" | `NotFoundError` (404) |
| "Invalid Credentials" | `UnauthorizedError` (401) |
| "Email not activated" | `ForbiddenError` (403) |
| "Order not found" | `OrderNotFoundError` (404) |
| "Product ID required" | `ValidationError` (400) |
| "Only DRAFT payroll runs can be confirmed" | `ConflictError` (409) or `ValidationError` (400) |
| "Insufficient stock" | `InsufficientStockError` (400) |

### B. Controllers calling `sendError` directly — 26 occurrences

These bypass the error middleware entirely:

| File | Count | Example |
|------|-------|---------|
| `employee/controllers/auth.controller.ts` | 2 | `sendError(res, 400, "VALIDATION_ERROR", "Invalid Data")` |
| `admin/controllers/auth.controller.ts` | 3 | `sendError(res, 500, "INTERNAL_ERROR", "Something went wrong")` |
| `order/order.controller.ts` | 3 | `sendError(res, 404, "NOT_FOUND", "Order not found")` |
| `employee/controllers/order.controller.ts` | 5 | `sendError(res, 400, "VALIDATION_ERROR", "employeeId is required")` |
| Various "Route not found" catch-all handlers | 7 | `sendError(res, 404, "NOT_FOUND", "Route not found")` |
| `product/product.controller.ts` | 2 | `sendError(res, 404, "NOT_FOUND", "No product found")` |
| `customer/customer.controller.ts` | 3 | `sendError(res, 404, "NOT_FOUND", "Product not found")` |
| `admin/controllers/inventory.controller.ts` | 1 | `sendError(res, 404, "NOT_FOUND", "Route not found")` |

**What should happen instead:** Throw the appropriate `AppError` subclass and let the middleware handle formatting. This ensures:
- One place to change error formatting
- Error logging (the middleware logs to console — soon to be structured logging)
- Consistent response shape
- The error is available for Sentry capture (from observability plan)

### C. Auth guards responding directly — 54 occurrences

Auth guards (`role.guard.ts`, `permission.guard.ts`, `casl.guard.ts`, `rbac.context.ts`) respond with `res.status(401/403).json({ error: "..." })` instead of throwing, and use a different response shape:

```typescript
// Uses: { error: "Authentication required" }
// Instead of: { success: false, error: { code: "UNAUTHORIZED", message: "..." } }
```

This means API clients can't reliably parse errors — some come as `{ error: "..." }`, others as `{ success: false, error: { code: "...", message: "..." } }`.

### D. No HTTP status code constants

Status codes are raw number literals throughout (`400`, `401`, `403`, `404`, `409`, `500`). There's no enum or constants file, so:
- Typos go unnoticed (e.g. `res.status(204).send()` vs `sendNoContent(res)` — already handled but not enforced)
- Changing a code means find-and-replace across files
- New developers have to remember HTTP codes

### E. Catch-all middleware ordering bug in `app.ts`

```typescript
// src/app.ts:24
// ⚠️ Registered BEFORE the error middleware
app.use((req, res) => {
  res.status(400).json({ message: "Final mmiddleware error" });
});

// src/app.ts:28
app.use(errorMiddleware);
```

Problems:
1. Catch-all returns 400 instead of 404 for unmatched routes
2. It's placed before the error middleware, so errors calling `next(error)` from a previous handler could theoretically be caught by this before reaching the error middleware
3. Typo: "mmiddleware"
4. Uses `{ message: "..." }` instead of the shared response format

---

## 4. Migration Plan

### Phase 1 — Fix the base classes (no behavior change)

- [ ] Add an HTTP status code enum (`src/modules/ecom/shared/http-status.ts`) to eliminate raw number literals:

```typescript
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
```

- [ ] Add a `TooManyRequestsError` (429) subclass — needed by the rate limiting from the security plan:

```typescript
export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429, "TOO_MANY_REQUESTS");
    this.name = "TooManyRequestsError";
  }
}
```

- [ ] Add a `ServiceUnavailableError` (503) subclass for planned maintenance / down streams:

```typescript
export class ServiceUnavailableError extends AppError {
  constructor(message = "Service temporarily unavailable") {
    super(message, 503, "SERVICE_UNAVAILABLE");
    this.name = "ServiceUnavailableError";
  }
}
```

### Phase 2 — Migrate `throw new Error(...)` → `AppError` subclasses (38 occurrences)

For each file, replace plain `throw new Error(...)` with the appropriate subclass:

| Current | Replacement |
|---------|------------|
| `throw new Error("Employee not found")` | `throw new NotFoundError("Employee not found")` |
| `throw new Error("Invalid Credentials")` | `throw new UnauthorizedError("Invalid credentials")` |
| `throw new Error("Email not activated")` | `throw new ForbiddenError("Email not activated")` |
| `throw new Error("Order not found")` | `throw new OrderNotFoundError(orderId)` |
| `throw new Error("Product ID required")` | `throw new ValidationError("Product ID required")` |
| `throw new Error("Only DRAFT payroll runs can be confirmed")` | `throw new ConflictError("Only DRAFT payroll runs can be confirmed")` |

- [ ] `admin/services/employee.service.ts` — 15 replacements
- [ ] `employee/services/auth.service.ts` — 5 replacements
- [ ] `admin/services/auth.service.ts` — 4 replacements
- [ ] `employee/services/order.service.ts` — 4 replacements
- [ ] `product/product.admin.service.ts` — 4 replacements
- [ ] `admin/repo/inventory.repo.ts` — 2 replacements
- [ ] `order/order.service.ts` — 1 replacement
- [ ] `customer/customer.service.ts` — 1 replacement
- [ ] `auth/rbac/rbac.repo.ts` — 1 replacement

### Phase 3 — Migrate `sendError` in controllers → throw (26 occurrences)

For each controller, replace:

```typescript
// ❌ Before
sendError(res, 404, "NOT_FOUND", "Order not found");
```

with:

```typescript
// ✅ After
throw new NotFoundError("Order not found");
```

And ensure the `try/catch` and `next(error)` are present (all controllers already have this pattern).

- [ ] `order/order.controller.ts` — 3 replacements
- [ ] `employee/controllers/auth.controller.ts` — 2 replacements
- [ ] `employee/controllers/order.controller.ts` — 5 replacements
- [ ] `admin/controllers/auth.controller.ts` — 3 replacements
- [ ] `admin/controllers/employee.controller.ts` — 2 replacements
- [ ] `admin/controllers/inventory.controller.ts` — 1 replacement
- [ ] `customer/customer.controller.ts` — 3 replacements
- [ ] `product/product.controller.ts` — 2 replacements
- [ ] Remove "Route not found" catch-all handlers from controllers (these should be handled at the router level instead)

### Phase 4 — Fix auth guards to use shared error format (54 occurrences)

Update `role.guard.ts`, `permission.guard.ts`, `casl.guard.ts`, and `rbac.context.ts` to throw `AppError` subclasses instead of responding directly:

```typescript
// ❌ Before
res.status(401).json({ error: "Authentication required" });

// ✅ After
throw new UnauthorizedError("Authentication required");
```

This requires:
- Guards must call `next(error)` or let the error propagate to Express's error middleware
- Remove the direct `res.status().json()` calls
- Ensure consistency: all errors go through the same middleware

- [ ] `auth/guards/role.guard.ts` — 4 occurrences
- [ ] `auth/guards/permission.guard.ts` — 4 occurrences
- [ ] `auth/casl/guards/casl.guard.ts` — 4 occurrences
- [ ] `auth/rbac/rbac.context.ts` — 4 occurrences

### Phase 5 — Fix `app.ts` catch-all middleware

- [ ] Move catch-all handler after the error middleware
- [ ] Change status from 400 to 404
- [ ] Use the shared response format (or throw `NotFoundError`):

```typescript
// After error middleware — only reached if no route matched
app.use((_req: Request, res: Response) => {
  sendError(res, 404, "NOT_FOUND", "Route not found");
});

app.use(errorMiddleware);
```

### Phase 6 — Add domain-specific errors for remaining modules

Currently only `order/` has domain-specific errors. Add them for modules that would benefit:

- [ ] `admin/errors.ts` — `EmployeeNotFoundError`, `PayrollRunNotFoundError`
- [ ] `product/errors.ts` — `ProductNotFoundError` (extract from `order/order.errors.ts` since it's product-domain-specific)
- [ ] `employee/errors.ts` — `EmployeeAuthError`, `EmployeeOrderNotFoundError`
- [ ] `customer/errors.ts` — `CustomerNotFoundError`, `CartItemNotFoundError`
- [ ] `inventory/errors.ts` — `InventoryNotFoundError`, `InsufficientStockError` (extract from `order/order.errors.ts` since it's inventory-domain-specific)

### Phase 7 — Future enhancements (optional)

- [ ] Add `error.toJSON()` method on `AppError` for serialization:

```typescript
export class AppError extends Error {
  // ...
  toJSON(): ApiError {
    return {
      code: this.code,
      message: this.message,
      details: "details" in this ? (this as any).details : undefined,
    };
  }
}
```

- [ ] Add a `serializeError()` utility for the middleware that strips sensitive info
- [ ] Consider `neverthrow` or `Result` types for explicit error handling in services (if the team prefers functional error handling)

---

## 5. Checklist Summary

### Phase 1 — Base class improvements
- [ ] Create `src/modules/ecom/shared/http-status.ts` with `HttpStatus` enum
- [ ] Add `TooManyRequestsError` (429)
- [ ] Add `ServiceUnavailableError` (503)

### Phase 2 — Migrate plain `throw new Error()` (38 occurrences)
- [ ] `admin/services/employee.service.ts` (15)
- [ ] `employee/services/auth.service.ts` (5)
- [ ] `admin/services/auth.service.ts` (4)
- [ ] `employee/services/order.service.ts` (4)
- [ ] `product/product.admin.service.ts` (4)
- [ ] `admin/repo/inventory.repo.ts` (2)
- [ ] `order/order.service.ts` (1)
- [ ] `customer/customer.service.ts` (1)
- [ ] `auth/rbac/rbac.repo.ts` (1)

### Phase 3 — Migrate `sendError` in controllers → throw (26 occurrences)
- [ ] `order/order.controller.ts` (3)
- [ ] `employee/controllers/auth.controller.ts` (2)
- [ ] `employee/controllers/order.controller.ts` (5)
- [ ] `admin/controllers/auth.controller.ts` (3)
- [ ] `admin/controllers/employee.controller.ts` (2)
- [ ] `admin/controllers/inventory.controller.ts` (1)
- [ ] `customer/customer.controller.ts` (3)
- [ ] `product/product.controller.ts` (2)

### Phase 4 — Fix auth guards (54 occurrences)
- [ ] `auth/guards/role.guard.ts` (4)
- [ ] `auth/guards/permission.guard.ts` (4)
- [ ] `auth/casl/guards/casl.guard.ts` (4)
- [ ] `auth/rbac/rbac.context.ts` (4)

### Phase 5 — Fix `app.ts` catch-all handler
- [ ] Move after error middleware
- [ ] Change 400 → 404
- [ ] Use shared response format

### Phase 6 — Domain-specific errors
- [ ] `admin/errors.ts`
- [ ] `product/errors.ts`
- [ ] `employee/errors.ts`
- [ ] `customer/errors.ts`
- [ ] `inventory/errors.ts`

---

## 6. What "Good" Looks Like

```typescript
// Service — throws typed errors
async getEmployee(id: number): Promise<Employee> {
  const employee = await employeeRepo.findById(id);
  if (!employee) throw new EmployeeNotFoundError(id);
  return employee;
}

// Controller — catches nothing, just passes through
async getEmployee(req: Request, res: Response, next: NextFunction) {
  const employee = await employeeService.getEmployee(req.params.id);
  sendSuccess(res, employee);
}

// Guard — throws like everything else
function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session) throw new UnauthorizedError();
  next();
}

// Global middleware — one place for all error formatting
function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }
  if (err instanceof z.ZodError) {
    sendError(res, 400, "VALIDATION_ERROR", "Validation failed", err.issues);
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      sendError(res, 409, "CONFLICT", "Resource already exists");
      return;
    }
  }
  console.error("[ErrorMiddleware]", err);
  sendError(res, 500, "INTERNAL_ERROR", "Internal server error");
}
```

Key properties:
- **Every path** that can fail throws an `AppError` subclass — no plain `Error` escapes
- **No controller** calls `sendError` directly — they let the middleware format everything
- **Auth guards** throw, not respond — consistent error shape everywhere
- **One catch-all** at the router level for unmatched routes (404)
- **Status code literals** replaced by named constants

---

*Start with Phase 1 (the new subclasses won't break anything), then work through Phase 2 file by file. Each file in Phase 2 is a safe, isolated change: replace `throw new Error(...)` with the correct subclass and nothing breaks.*
