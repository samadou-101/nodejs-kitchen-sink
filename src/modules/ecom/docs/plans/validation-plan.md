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

### Phase 3: Customer Module (Public)

**Step 3.1: Create Customer Schemas** (`customer.schema.ts`)
- `CartItemSchema` - cart item validation
- `CheckoutDataSchema` - checkout payload
- `PhoneQuerySchema` - phone number for tracking

**Step 3.2: Create Customer Validators** (`customer.validator.ts`)
- `validateCheckoutData(data: unknown): CheckoutData`
- `validateCartItem(data: unknown): CartItem`
- `validatePhone(phone: unknown): string`

**Step 3.3: Update Controllers**
- `customer/customer.controller.ts`

---

### Phase 4: Admin Module - Employee Service

**Step 4.1: Create Admin Schemas** (`admin.schema.ts`)
- `AddEmployeeEmailSchema` - email for pending list
- `AssignRoleSchema` - { userId, roleId }
- `EmployeeStatusSchema` - { employeeId, isActive }
- `PaymentTypeSchema` - { paymentTypeId, salaryAmount?, perOrderRate? }
- `SalaryUpdateSchema` - { salaryAmount }
- `RateUpdateSchema` - { perOrderRate }
- `CreatePaymentSchema` - payment creation
- `PayrollRunInputSchema` - payroll preview/create
- `PayrollRunIdSchema` - route param validation
- `EmployeePerformanceQuerySchema` - { days? }

**Step 4.2: Create Admin Validators** (`admin.validator.ts`)
- `validateEmail(email: unknown): string`
- `validateAssignRole(data: unknown): { userId: number, roleId: number }`
- `validateEmployeeStatus(data: unknown): { employeeId: number, isActive: boolean }`
- `validatePaymentType(data: unknown): PaymentTypeInput`
- `validatePayrollRunInput(data: unknown): PayrollRunInput`
- `validatePayrollRunId(id: unknown): number`

**Step 4.3: Update Controllers**
- `admin/controllers/employee.controller.ts`

---

### Phase 5: Admin Module - Inventory Service

**Step 5.1: Create Inventory Schemas** (`inventory.schema.ts`)
- `InventoryAdjustDataSchema` - stock adjustment
- `ProductIdSchema` - product ID validation
- `ThresholdSchema` - low stock threshold

**Step 5.2: Create Inventory Validators** (`inventory.validator.ts`)
- `validateInventoryAdjust(data: unknown): InventoryAdjustData`
- `validateProductId(id: unknown): number`
- `validateThreshold(threshold: unknown): number`

**Step 5.3: Update Controllers**
- `admin/controllers/inventory.controller.ts`

---

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
| 3 | Customer | 3 | 3 | 1 | Pending |
| 4 | Admin - Employee | 9 | 6 | 1 | Pending |
| 5 | Admin - Inventory | 3 | 3 | 1 | Pending |
| 6 | Employee | 2 | 2 | 2 | Pending |
| 7 | Shared | 3 | 3 | - | Pending |

**Total**: 28 schemas, 27 validators, 7 controllers to update

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