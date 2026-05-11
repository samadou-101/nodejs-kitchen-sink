# E-commerce Validation Plan

## Overview

This plan outlines a step-by-step approach to implement Zod-based input validation across all e-commerce modules, following separation of concerns principles.

## Problem Statement

Based on the authorization report, there is **no input validation** on service inputs. Types in `.types.ts` files are TypeScript interfaces only - they provide zero runtime validation. This means:
- Invalid data flows directly to database operations
- Type errors only caught at runtime (if at all)
- No clear error messages for invalid inputs
- Business logic mixed with type checking

## Solution Architecture

### Directory Structure

```
src/modules/ecom/
├── validation/                    # NEW: Central validation layer
│   ├── index.ts                  # Barrel export
│   ├── schemas/                  # Zod schema definitions
│   │   ├── index.ts
│   │   ├── product.schema.ts
│   │   ├── order.schema.ts
│   │   ├── customer.schema.ts
│   │   ├── admin.schema.ts
│   │   ├── employee.schema.ts
│   │   └── inventory.schema.ts
│   └── validators/               # Validator functions
│       ├── index.ts
│       ├── product.validator.ts
│       ├── order.validator.ts
│       ├── customer.validator.ts
│       ├── admin.validator.ts
│       ├── employee.validator.ts
│       └── inventory.validator.ts
```

### Validation Flow

```
Controller (req.body) → Validator (Zod parse) → Service (business logic) → Repository
```

**Key Principle**: Validation happens at the controller/service boundary, NOT inside services. Services receive already-validated data.

## Implementation Steps

### Phase 1: Product Module ✅ COMPLETED

**Step 1.1: Create Product Schemas** (`product.schema.ts`) ✅
- `CategoryDataSchema` - validates category input
- `ProductDataSchema` - validates product input
- `ProductFilterSchema` - validates query params for filtering

**Step 1.2: Create Product Validators** (`product.validator.ts`) ✅
- `validateCategoryData(data: unknown): CategoryData`
- `validateProductData(data: unknown): ProductData`
- `validateProductFilter(data: unknown): ProductFilter`
- `validateProductId(id: unknown): number`
- `validateCategoryId(id: unknown): number`

**Step 1.3: Update Controllers** ✅
- Import validators in controllers
- Call validators before passing to services
- Return 400 with Zod error message on validation failure

**Files created/updated**:
- `validation/schemas/product.schema.ts` - NEW
- `validation/validators/product.validator.ts` - NEW
- `validation/schemas/index.ts` - NEW
- `validation/validators/index.ts` - NEW
- `validation/index.ts` - NEW
- `product/product.controller.ts` - UPDATED

**Services affected** (validation at boundary, no change needed):
- `product/product.admin.service.ts` - already has types

---

### Phase 2: Order Module ✅ COMPLETED

**Step 2.1: Create Order Schemas** (`order.schema.ts`) ✅
- `OrderCustomerSchema` - nested customer object
- `OrderItemSchema` - individual order item
- `OrderDataSchema` - complete order input
- `OrderFilterSchema` - query params for listing
- `OrderStatusUpdateSchema` - status change payload
- `AssignEmployeeSchema` - employee assignment body

**Step 2.2: Create Order Validators** (`order.validator.ts`) ✅
- `validateOrderData(data: unknown): OrderData`
- `validateOrderId(id: unknown): number`
- `validateOrderFilter(data: unknown): OrderFilter`
- `validateOrderStatusUpdate(data: unknown): { statusId: number }`
- `validateAssignEmployee(data: unknown): { employeeId: number }`

**Step 2.3: Update Controllers** ✅
- `order/order.controller.ts`

**Files created/updated**:
- `validation/schemas/order.schema.ts` - NEW
- `validation/validators/order.validator.ts` - NEW
- `validation/schemas/index.ts` - UPDATED
- `validation/validators/index.ts` - UPDATED
- `validation/index.ts` - already existed
- `order/order.controller.ts` - UPDATED

**Services affected** (validation at boundary, no change needed):
- `order/order.service.ts` - already has types

---

**Schema Details:**
- `OrderCustomerSchema`: Validates customer object with name, phone, address, email
- `OrderItemSchema`: Validates order item with productId, price, quantity, optional orderItemId
- `OrderDataSchema`: Validates complete order with nested customer, orderItems array (min 1), orderDate (coerced), orderStatusId, optional employeeId and notes
- `OrderFilterSchema`: Validates query params with statusId, employeeId, page (default 1), limit (default 20, max 100)
- `OrderStatusUpdateSchema`: Validates statusId for status changes
- `AssignEmployeeSchema`: Validates employeeId for employee assignment

**Controller Updates:**
- Added Zod import and validation error handler
- Replaced all manual `parseInt`/`isNaN` checks with `validateOrderId`
- Replaced manual type casting with Zod validators for body and query data
- Added proper 400 response with validation error details on failure
- Cast validated data to existing types for service compatibility

---

### Phase 3: Customer Module ✅ COMPLETED

**Step 3.1: Create Customer Schemas** (`customer.schema.ts`) ✅
- `CartItemSchema` - cart item validation
- `CheckoutDataSchema` - checkout payload validation
- `PhoneSchema` - phone number for tracking
- `TrackingOrderIdSchema` - order ID for public tracking route
- `SearchQuerySchema` - product search query param

**Step 3.2: Create Customer Validators** (`customer.validator.ts`) ✅
- `validateCheckoutData(data: unknown): CheckoutData`
- `validateCartItem(data: unknown): CartItem`
- `validatePhone(phone: unknown): string`
- `validateTrackingOrderId(id: unknown): number` — named to avoid barrel collision with `order.validator.ts`
- `validateSearchQuery(query: unknown): string`

**Step 3.3: Update Controllers** ✅
- `customer/customer.controller.ts`

**Files created/updated**:
- `validation/schemas/customer.schema.ts` - NEW
- `validation/validators/customer.validator.ts` - NEW
- `validation/schemas/index.ts` - UPDATED
- `validation/validators/index.ts` - UPDATED
- `customer/customer.controller.ts` - UPDATED

**Services affected** (validation at boundary, no change needed):
- `customer/customer.service.ts` - already has types

---

**Reused Validators** (from other modules):
- `validateProductFilter` (product module) — `GET /products`
- `validateProductId` (product module) — `GET /product/:id`

**Schema Details:**
- `CartItemSchema`: Validates cart item with productId (positive int), quantity (positive int)
- `CheckoutDataSchema`: Validates checkout with name, phone, address, city (required strings), optional notes, items array (min 1)
- `PhoneSchema`: Validates phone query param as non-empty string
- `TrackingOrderIdSchema`: Coerces order ID route param to positive int
- `SearchQuerySchema`: Validates search query as non-empty string

**Controller Updates:**
- Added Zod import and validation error handler with `error instanceof z.ZodError` → 400 + `error.issues`
- `GET /products` — replaced manual `Number()` casts with `validateProductFilter(req.query)`
- `GET /products/search` — replaced `req.query.q as string` + bare `if (!query)` with `validateSearchQuery(req.query.q)`
- `GET /product/:id` — replaced `Number(req.params.id)` with `validateProductId(req.params.id)`
- `POST /checkout` — replaced `req.body as CheckoutData` + manual field checks with `validateCheckoutData(req.body)`
- `GET /orders/track` — replaced `req.query.phone as string` + bare check with `validatePhone(req.query.phone)`
- `GET /orders/:id` — replaced `Number(req.params.id)` with `validateTrackingOrderId(req.params.id)`

---

**Barrel Export Note**: `validateTrackingOrderId` renamed from `validateOrderId` because `order.validator.ts` already exports a `validateOrderId`, causing an ambiguous re-export error. This may occur in future phases — use unique names or explicit re-exports to resolve conflicts.

### Phase 4: Admin Module - Employee Service ✅ COMPLETED

**Step 4.1: Create Admin Schemas** (`admin.schema.ts`) ✅
- `AddEmployeeEmailSchema` - email for pending list
- `PaymentTypeSchema` - discriminated union: `{ paymentTypeId: 1, salaryAmount } | { paymentTypeId: 2, perOrderRate }`
- `CreatePaymentSchema` - payment creation body
- `PayrollRunInputSchema` - payroll preview/create with `z.coerce.date()`
- `PayrollRunStatusSchema` - enum `DRAFT | CONFIRMED | PAID` for query filter
- `PayrollRunIdSchema` - route param coercion
- `PayrollRunItemIdSchema` - route param coercion for item routes
- `EmployeeIdSchema` - route param coercion for employee routes
- `EmployeePerformanceQuerySchema` - `{ days? }` with coercion

**Step 4.2: Create Admin Validators** (`admin.validator.ts`) ✅
- `validateEmail(data: unknown): { email: string }`
- `validatePaymentType(data: unknown): PaymentTypeData` (discriminated union)
- `validateCreatePayment(data: unknown): CreatePaymentData`
- `validatePayrollRunInput(data: unknown): PayrollRunInput`
- `validatePayrollRunStatus(status: unknown): PayrollRunStatus | undefined` — returns `undefined` when no status filter
- `validatePayrollRunId(id: unknown): number`
- `validatePayrollRunItemId(id: unknown): number`
- `validateEmployeeId(id: unknown): number`
- `validateEmployeePerformanceQuery(data: unknown): { days?: number }`

**Step 4.3: Update Controllers** ✅
- `admin/controllers/employee.controller.ts`

**Files created/updated**:
- `validation/schemas/admin.schema.ts` - NEW
- `validation/validators/admin.validator.ts` - NEW
- `validation/schemas/index.ts` - UPDATED
- `validation/validators/index.ts` - UPDATED
- `admin/controllers/employee.controller.ts` - UPDATED

**Services affected** (validation at boundary, no change needed):
- `admin/services/employee.service.ts` - already has types

---

**Note**: 4 schemas from the original plan (`AssignRoleSchema`, `EmployeeStatusSchema`, `SalaryUpdateSchema`, `RateUpdateSchema`) were skipped because the controller has no corresponding routes for role assignment, employee status toggle, salary-only update, or rate-only update. The service exports these functions but they are not wired to any HTTP handler.

**Schema Details:**
- `AddEmployeeEmailSchema`: Validates body with `email: z.string().email()`
- `PaymentTypeSchema`: Uses `z.discriminatedUnion("paymentTypeId", [...])` — type 1 requires `salaryAmount`, type 2 requires `perOrderRate`. Eliminates the manual if-else branching in the controller via TypeScript narrowing.
- `CreatePaymentSchema`: Validates `amount` (positive number), optional `paymentPeriodLabel`, `notes`, `contractId`
- `PayrollRunInputSchema`: Uses `z.coerce.date()` for `startDate` and `endDate` (replaces manual `new Date()` casts), optional `employeeIds` array
- `PayrollRunStatusSchema`: `z.enum(["DRAFT", "CONFIRMED", "PAID"])` — validates query param, validator returns `undefined` when param is absent
- `PayrollRunIdSchema` / `PayrollRunItemIdSchema` / `EmployeeIdSchema`: `z.coerce.number().int().positive()` — each is a separate schema type for clear error messages
- `EmployeePerformanceQuerySchema`: Coerced `days` (positive int), optional

**Controller Updates:**
- Added `z` import and 9 validator imports
- Replaced all 13 manual `parseInt` + `if (!idStr)` checks with `validateEmployeeId` / `validatePayrollRunId` / `validatePayrollRunItemId`
- `POST /admin/employee/add` — replaced `if (!email)` with `validateEmail(req.body)`
- `POST /admin/employees/:id/payment-type` — replaced `parseInt` + 4 conditionals with `validateEmployeeId` + `validatePaymentType` (discriminated union narrows the branch automatically)
- `POST /admin/employees/:id/payments` — replaced `parseInt` + `if (!amount)` with `validateEmployeeId` + `validateCreatePayment`
- `POST /admin/payroll/preview` + `POST /admin/payroll` — replaced `if (!startDate || !endDate)` + `new Date()` with `validatePayrollRunInput(req.body)` + `as PayrollRunInput` cast
- `GET /admin/payroll` — replaced `status as string` + `.toUpperCase()` + `as PayrollRunStatus` with `validatePayrollRunStatus(req.query.status)`
- `GET /admin/employees/:id/performance` — replaced inline `parseInt` ternary with `validateEmployeeId` + `validateEmployeePerformanceQuery(req.query)`
- All 13 catch blocks now check `error instanceof z.ZodError` → 400 + `error.issues` before `handleAuthError` / 500 fallthrough

### Phase 5: Admin Module - Inventory Service ✅ COMPLETED

**Step 5.1: Create Inventory Schemas** (`inventory.schema.ts`) ✅
- `InventoryAdjustDataSchema` - stock adjustment: `{ productId, action, amount }`
- `ProductIdSchema` - reusable product ID: `z.number().int().positive()`
- `ThresholdSchema` - low stock threshold with coercion: `z.coerce.number().int().positive()`

**Step 5.2: Create Inventory Validators** (`inventory.validator.ts`) ✅
- `validateInventoryAdjust(data: unknown): InventoryAdjustData`
- `validateThreshold(threshold: unknown): number | undefined` — returns `undefined` when no threshold filter

**Step 5.3: Update Controllers** ✅
- `admin/controllers/inventory.controller.ts`

**Files created/updated**:
- `validation/schemas/inventory.schema.ts` - NEW
- `validation/validators/inventory.validator.ts` - NEW
- `validation/schemas/index.ts` - UPDATED
- `validation/validators/index.ts` - UPDATED
- `admin/controllers/inventory.controller.ts` - UPDATED

**Services affected** (validation at boundary, no change needed):
- `admin/services/inventory.service.ts` - already has types

---

**Note**: `validateProductId` was intentionally excluded from the inventory validator because it already exists in `product.validator.ts` with an identical signature. The barrel re-export (`export *`) would cause an ambiguous name collision. `ProductIdSchema` remains in the schema file for composition (it's used inside `InventoryAdjustDataSchema`).

**Schema Details:**
- `ProductIdSchema`: `z.number().int().positive("Product ID must be a positive integer")` — matches the existing `validateProductId` in `product.validator.ts` pattern but as a schema (non-coerced, since productId comes from JSON body)
- `InventoryAdjustDataSchema`: Object with `productId` (using `ProductIdSchema`), `action` (`z.enum(["increase", "decrease"])`), and `amount` (`z.number().positive()`)
- `ThresholdSchema`: `z.coerce.number().int().positive()` — coerces query string to number

**Controller Updates:**
- Added `z` import and `validateInventoryAdjust` / `validateThreshold` imports
- `POST /admin/inventory/adjust` — replaced manual `if (!productId || !action || amount === undefined)` + `if (!["increase", "decrease"].includes(action))` with `validateInventoryAdjust(req.body ?? {})` destructured to `{ productId, action, amount }`
- `GET /admin/inventory/low-stock` — replaced `req.query.threshold ? Number(req.query.threshold) : 10` with `validateThreshold(req.query.threshold) ?? 10`
- Updated both catch blocks to check `error instanceof z.ZodError` → 400 + `error.issues` before `handleAuthError` / 500 fallthrough
- Changed `catch (error: any)` to `catch (error: unknown)` for both routes (SAFER type narrowing)

### Phase 6: Employee Module

**Step 6.1: Create Employee Schemas** (`employee.schema.ts`)
- `EmployeeLoginSchema` - { email, password }
- `EmployeeOrderUpdateSchema` - { notes? }

**Step 6.2: Create Employee Validators** (`employee.validator.ts`)
- `validateEmployeeLogin(data: unknown): EmployeeLoginData`
- `validateOrderNote(data: unknown): { notes?: string }`

**Step 6.3: Update Controllers**
- `employee/controllers/order.controller.ts`
- `employee/controllers/auth.controller.ts`

---

### Phase 7: Cross-Cutting Concerns

**Step 7.1: Create Shared Validators**
- `validateId(id: unknown): number` - reusable ID validator
- `validatePagination(data: unknown): { page?: number, limit?: number }`
- `validateDateRange(data: unknown): { startDate: Date, endDate: Date }`

**Step 7.2: Error Handling**
- Create standardized error format for validation errors
- Update all controllers to use consistent error responses

## Zod Schema Guidelines

### Naming Convention
- Schema: `{TypeName}Schema` (e.g., `ProductDataSchema`)
- Validator: `validate{TypeName}` (e.g., `validateProductData`)

### Schema Pattern
```typescript
// product.schema.ts
import { z } from "zod";

export const ProductDataSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  categoryId: z.number().int().positive(),
  initialStock: z.number().int().min(0).optional(),
});

export type ProductData = z.infer<typeof ProductDataSchema>;
```

### Validator Pattern
```typescript
// product.validator.ts
import { ProductDataSchema } from "../schemas/product.schema";

export function validateProductData(data: unknown): ProductData {
  return ProductDataSchema.parse(data);
}
```

### Error Handling in Controllers
```typescript
// In controller
try {
  const validatedData = validateProductData(req.body);
  const result = await createProduct(validatedData, req.auth);
  res.status(201).json(result);
} catch (error) {
  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: error.issues,  // Zod v4 uses .issues (not .errors)
    });
    return;
  }
  // Handle other errors...
}
```

## Services Remain Unchanged

**Important**: Services should NOT be modified to add validation. The validation happens at the controller boundary. Services continue to receive typed data and can trust that the data is valid.

This follows the separation of concerns:
- **Controllers**: Handle HTTP concerns (parsing, validation, response)
- **Services**: Handle business logic (authorization, DB operations)
- **Repositories**: Handle data access (SQL queries)

## Summary

| Phase | Module | Schemas | Validators | Controllers | Status |
|-------|--------|---------|------------|-------------|--------|
| 1 | Product | 3 | 5 | 1 | ✅ Complete |
| 2 | Order | 6 | 5 | 1 | ✅ Complete |
| 3 | Customer | 5 | 5 | 1 | ✅ Complete |
| 4 | Admin - Employee | 9 | 9 | 1 | ✅ Complete |
| 5 | Admin - Inventory | 3 | 2 | 1 | ✅ Complete |
| 6 | Employee | 2 | 2 | 2 | Pending |
| 7 | Shared | 3 | 3 | - | Pending |

**Total**: 31 schemas, 31 validators, 7 controllers to update

## Benefits

1. **Runtime Validation**: Invalid inputs rejected early with clear error messages
2. **Single Source of Truth**: Zod schemas define both types and validation
3. **Separation of Concerns**: Controllers handle validation, services handle business logic
4. **Type Safety**: `z.infer` generates TypeScript types from Zod schemas
5. **Consistency**: All modules follow the same validation pattern
6. **Maintainability**: Validation logic centralized in dedicated files

## Implementation Notes

### Phase 1 Implementation Details

**Files Created:**
```
src/modules/ecom/validation/
├── index.ts                                    # Barrel export
├── schemas/
│   ├── index.ts                                # Schema exports
│   └── product.schema.ts                       # Product Zod schemas
└── validators/
    ├── index.ts                                # Validator exports
    └── product.validator.ts                   # Product validators
```

**Schema Details:**
- `CategoryDataSchema`: Validates category with name (required), description (optional), categoryId (optional for updates)
- `ProductDataSchema`: Validates product with name (required), price (positive number), categoryId (positive integer), optional description and initialStock
- `ProductFilterSchema`: Validates search query, categoryId, page (default 1), limit (default 20, max 100)

**Controller Updates:**
- Added Zod import and validation error handler
- Replaced manual type casting with Zod validators
- Added proper 400 response with validation error details on failure
- Cast validated data to existing types for service compatibility

**Validation Error Response Format:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_small",
      "message": "Price must be positive",
      "path": ["price"]
    }
  ]
}
```