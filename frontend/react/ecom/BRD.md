# Business Requirements Document — COD Algeria E-commerce

> **Project:** Node Kitchen Sink — E-Commerce Module
> **Domain:** Cash on Delivery (COD) e-commerce with internal employee management
> **Backend:** Express + Prisma + PostgreSQL + Redis
> **Frontend:** React 19 + TypeScript + Vite (this project)

---

## 1. Project Overview

### Goal

Build a simple COD (Cash on Delivery) e-commerce platform for Algeria with internal employee management focused on order confirmation and operational validation.

### Constraints

| Constraint | Detail |
|---|---|
| **Payment** | COD only — no online payments, no payment gateway, no Stripe |
| **Auth** | No OTP, no customer authentication complexity |
| **Employees** | Handle only order confirmation via phone (no logistics, no delivery) |
| **Authority** | Admin is the system authority for all decisions |

### Non-Goals (MVP)

- No delivery tracking system / GPS / logistics optimization
- No automated payroll system
- No HR / legal contract management
- No wallet or subscription system
- No customer login (orders tracked by phone number)

---

## 2. Core Users & Roles

### 2.1 Customer (Public — No Auth)

- Browse products with pagination and category filtering
- Search products by name/description
- View product details
- Place COD orders (provides name, phone, address, city, optional notes)
- Track order status by phone number

### 2.2 Admin (System Owner — Auth Required)

**Role guards:** `SUPERADMIN` or `ADMIN`

- Manage products (CRUD) and categories (CRUD)
- Manage inventory (stock adjustments, view low-stock alerts)
- Manage orders (view all, create, update, delete, assign/unassign employees)
- Manage employees (add to pending list, assign payment type, view performance)
- Manage payroll (preview, create draft, confirm, mark as paid)
- Default threshold for low-stock alerts: `10`

### 2.3 Employee (Order Confirmation Staff — Auth Required)

**Role guard:** `EMPLOYEE`

- View orders assigned to them
- Confirm order validity (Pending → Confirmed)
- Reject order (Pending → Cancelled)
- Add confirmation notes
- **Note:** The actual phone call to the customer happens *outside* the system

### 2.4 SUPERADMIN vs ADMIN Distinction

| Capability | SUPERADMIN | ADMIN | EMPLOYEE |
|---|---|---|---|
| All operations | ✅ (`*:*`) | ❌ | ❌ |
| Product management | ✅ | ✅ | ❌ |
| Order management | ✅ | ✅ | ❌ (only assigned) |
| Employee management | ✅ | ✅ | ❌ |
| Payroll management | ✅ | ✅ | ❌ |
| Inventory management | ✅ | ✅ | ❌ |
| View own assigned orders | ✅ | ✅ | ✅ |

---

## 3. COD Order Lifecycle

### 3.1 Status Flow

```
[Customer Checkout]
        │
        ▼
    ┌─────────┐
    │ Pending  │  (orderStatusId: 1)  ← Default on creation
    │  (1)     │
    └────┬─────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────┐
│Confirmed│ │Cancelled │  (orderStatusId: 5)
│  (2)    │ │  (5)     │
└────┬────┘ └──────────┘
     │
     ▼
┌─────────┐
│ Shipped │  (orderStatusId: 3)  — Defined in PRD, no code yet
│  (3)    │
└────┬────┘
     │
     ▼
┌──────────┐
│ Delivered│  (orderStatusId: 4)  — Defined in PRD, no code yet
│  (4)     │
└──────────┘
```

### 3.2 Key Behaviors by Status Transition

| Transition | What Happens |
|---|---|
| **Pending → Confirmed** (1→2) | Inventory is **decremented** atomically (`checkAndDecrementInventory`). Throws `InsufficientStockError` if stock unavailable. |
| **Confirmed → Cancelled** (2→3/5) | Inventory is **restored** (`incrementInventoryBatch`). |
| **Pending → Cancelled** (1→5) | No inventory side effects (stock was never decremented). |
| **Any → Shipped/Delivered** | No inventory side effects in current code. |

### 3.3 Deferred Inventory Model

**Critical design decision:** Stock is **not** decremented at checkout. It is only decremented when an employee **confirms** the order. This means:
- Multiple customers can order the same last-in-stock item
- The first employee to confirm gets the stock
- Later confirmations fail with `InsufficientStockError`

### 3.4 Checkout Flow (Customer)

1. Customer fills checkout form: `{ name, phone, address, city, notes?, items[] }`
2. Backend fetches **current** prices from DB (client-supplied prices are NOT trusted)
3. Backend validates stock availability for each item
4. Creates `Customer` + `Order` (statusId=1) + `OrderItem` records in a transaction
5. Returns the created order
6. Customer can track via `GET /orders/track?phone=xxx`

### 3.5 Order Confirmation Flow (Employee)

1. Admin assigns employee to an order (`PATCH /order/:id/employee`)
2. Employee views assigned orders (`GET /employee/orders`)
3. Employee calls customer (outside the system)
4. Employee confirms (`PATCH /employee/orders/:id/confirm`) → status 2, inventory decremented
5. OR Employee rejects (`PATCH /employee/orders/:id/reject`) → status 5

---

## 4. API Endpoints Reference

Base path: `/api/ecom`

### 4.1 Public Routes (No Auth)

| Method | Path | Description |
|---|---|---|
| `GET` | `/products` | List products (paginated, filterable by `search`, `categoryId`) |
| `GET` | `/product/:id` | Get product by ID |
| `GET` | `/categories` | List all categories |
| `GET` | `/category/:id` | Get category by ID |
| `GET` | `/products/search` | Search products by query |
| `GET` | `/cart` | View cart (placeholder — no backend cart logic) |
| `POST` | `/cart/add` | Add to cart (placeholder) |
| `PATCH` | `/cart/:itemId` | Update cart item (placeholder) |
| `DELETE` | `/cart/:itemId` | Remove cart item (placeholder) |
| `DELETE` | `/cart` | Clear cart (placeholder) |
| `POST` | `/checkout` | Place COD order |
| `GET` | `/orders/track` | Track orders by `?phone=xxx` |
| `GET` | `/orders/:id` | Get order by ID (for tracking) |
| `POST` | `/admin/signup` | Register admin |
| `POST` | `/admin/login` | Admin login |
| `POST` | `/employee/signup` | Register employee (requires pending approval) |
| `POST` | `/employee/login` | Employee login |

### 4.2 Admin Routes (Auth: `[authenticate, requireRole("ADMIN")]`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/product/create` | Create product |
| `POST` | `/product/update` | Update product |
| `DELETE` | `/product/:id` | Delete product |
| `POST` | `/category` | Create category |
| `POST` | `/category/update` | Update category |
| `DELETE` | `/category/:id` | Delete category |
| `POST` | `/order/create` | Create order (admin-facing) |
| `GET` | `/orders` | List all orders (paginated, filterable by `statusId`, `employeeId`) |
| `GET` | `/order/:id` | Get order by ID |
| `PATCH` | `/order/:id` | Update order |
| `DELETE` | `/order/:id` | Delete order |
| `PATCH` | `/order/:id/status` | Update order status |
| `PATCH` | `/order/:id/employee` | Assign employee to order |
| `PATCH` | `/order/:id/employee/remove` | Unassign employee |
| `POST` | `/admin/employee/add` | Add employee email to pending list |
| `POST` | `/admin/employees/:id/payment-type` | Assign payment type (salary or per-order) |
| `POST` | `/admin/employees/:id/payments` | Create manual payment |
| `GET` | `/admin/employees/:id/performance` | View employee performance |
| `POST` | `/admin/payroll/preview` | Preview payroll run for period |
| `POST` | `/admin/payroll` | Create payroll run (DRAFT) |
| `GET` | `/admin/payroll` | List payroll runs |
| `GET` | `/admin/payroll/:id` | Get payroll run by ID |
| `POST` | `/admin/payroll/:id/confirm` | Confirm payroll run |
| `POST` | `/admin/payroll/:id/paid` | Mark payroll as PAID |
| `POST` | `/admin/inventory/adjust` | Adjust stock (increase/decrease) |
| `GET` | `/admin/inventory/low-stock` | List low-stock products (default threshold: 10) |

### 4.3 Employee Routes (Auth: `[authenticate, requireRole("EMPLOYEE")]`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/employee/orders` | View assigned orders |
| `GET` | `/employee/orders/:id` | Get assigned order by ID |
| `PATCH` | `/employee/orders/:id/confirm` | Confirm order (Pending → Confirmed) |
| `PATCH` | `/employee/orders/:id/reject` | Reject order (Pending → Cancelled) |
| `POST` | `/employee/orders/:id/notes` | Add notes to order |

---

## 5. Data Models

### 5.1 Product

```typescript
type Product = {
  id?: number;
  name: string;                        // 1-255 chars
  description?: string;                // max 1000 chars
  price: number;                       // positive
  categoryId: number;                  // positive int
  initialStock?: number;               // min 0, used on creation to seed inventory
};
```

### 5.2 Category

```typescript
type Category = {
  categoryId?: number;
  name: string;                        // 1-255 chars
  description?: string;                // max 1000 chars
};
```

### 5.3 Customer (Checkout Data)

```typescript
type CheckoutData = {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  items: CartItem[];                   // min 1 item
};

type CartItem = {
  productId: number;                   // positive int
  quantity: number;                    // positive int
};
```

### 5.4 Order

```typescript
type OrderData = {
  orderId?: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
  orderItems: OrderItem[];             // min 1 item
  orderDate: Date;
  orderStatusId: number;               // 1=Pending, 2=Confirmed, 3=Shipped, 4=Delivered, 5=Cancelled
  employeeId?: number | null;
  notes?: string | null;
};

type OrderItem = {
  productId: number;                   // positive int
  price: number;                       // positive — fetched from DB, not trusted from client
  quantity: number;                    // positive int
  orderItemId?: number;
};
```

### 5.5 Employee

```typescript
type EmployeeData = {
  userId: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  password: string;
};

// Payment types (assigned by admin via contract):
// - Type 1: Salary (fixed monthly amount)
// - Type 2: Per-order (commission per confirmed order)
```

### 5.6 Inventory

```typescript
type Inventory = {
  productId: number;
  quantityAvailable: number;
};

// Actions: "increase" | "decrease"
// Low-stock defined as quantityAvailable < threshold (default threshold: 10)
```

### 5.7 Payroll

```typescript
type PayrollRunStatus = "DRAFT" | "CONFIRMED" | "PAID";
type PayrollRunItemCalcStatus = "PENDING" | "INCLUDED" | "EXCLUDED";
type PayrollRunItemPayStatus = "UNPAID" | "CONFIRMED" | "PAID";

type PayrollRunInput = {
  startDate: Date;
  endDate: Date;
  employeeIds?: number[];              // optional — if omitted, includes all active employees
};
```

### 5.8 Auth Context (Available on Authenticated Requests)

```typescript
type AuthContext = {
  userId: number;
  employeeId: number | null;
  roleNames: ("SUPERADMIN" | "ADMIN" | "EMPLOYEE")[];
  permissions: string[];               // e.g., ["product:*", "order:*"]
  isSuperAdmin: boolean;
};
```

---

## 6. Validation Schemas (Zod)

All request validation uses **Zod** on the backend. The frontend should mirror these constraints for UX.

### 6.1 Product Validation

| Field | Rule |
|---|---|
| `name` | `string`, min 1, max 255 |
| `description` | `string`, max 1000 (optional) |
| `price` | `number`, positive |
| `categoryId` | `number`, int, positive |
| `initialStock` | `number`, int, min 0 (optional) |
| Pagination: `page` | default 1 |
| Pagination: `limit` | default 20, max 100 |

### 6.2 Customer / Checkout Validation

| Field | Rule |
|---|---|
| `name` | `string`, min 1 |
| `phone` | `string`, min 1 |
| `address` | `string`, min 1 |
| `city` | `string`, min 1 |
| `notes` | `string` (optional) |
| `items` | array of `CartItem`, min 1 |
| `CartItem.productId` | `number`, int, positive |
| `CartItem.quantity` | `number`, int, positive |

### 6.3 Order Validation

| Field | Rule |
|---|---|
| `customer.name` | `string`, min 1 |
| `customer.phone` | `string`, min 1 |
| `customer.address` | `string`, min 1 |
| `customer.email` | valid email |
| `orderItems` | array of `OrderItem`, min 1 |
| `orderItems[].productId` | `number`, int, positive |
| `orderItems[].price` | `number`, positive |
| `orderItems[].quantity` | `number`, int, positive |
| `orderDate` | coerced date |
| `orderStatusId` | `number`, int, positive |
| `statusId` (updates) | `number`, int, positive |
| `employeeId` (assign) | `number`, int, positive |

### 6.4 Employee Validation

| Field | Rule |
|---|---|
| `email` (login) | valid email |
| `password` (login) | `string`, min 1 |
| `notes` (order notes) | `string`, min 1 |
| `AddEmployeeEmail` (admin) | valid email |

### 6.5 Inventory Validation

| Field | Rule |
|---|---|
| `productId` | `number`, int, positive |
| `action` | enum `"increase"` \| `"decrease"` |
| `amount` | `number`, positive |
| `threshold` (low-stock) | coerced positive int (default: 10) |

### 6.6 Shared Validation

| Schema | Rule |
|---|---|
| `IdSchema` | coerced positive int |
| `PaginationSchema` | page default 1, limit default 20 max 100 |
| `DateRangeSchema` | startDate, endDate (coerced dates) |

---

## 7. Authentication & Authorization

### 7.1 Auth Mechanism

- **Cookie-based sessions** (not JWT-bearer tokens)
- Session cookie name: `sid`
- Session stored in `prisma.session` table and cached in Redis (`session:{sid}`)
- TTL: 7 days, auto-extended when within 3 days of expiry
- **Known limitation:** Logout functions are no-ops (sessions are never revoked)

### 7.2 Auth Context Resolution Flow

```
Request with sid cookie
  → Read sid cookie
  → Check Redis cache `session:{sid}`
  → Fallback to DB if not cached
  → Validate not expired/revoked
  → Auto-extend if within 3 days of expiry
  → Resolve AuthContext:
      → Check Redis cache `auth:user:{userId}`
      → Fallback to DB query (roles + permissions)
      → Cache for 15 minutes
  → Attach to req.auth
```

### 7.3 Request Guard Layers

```
[1] authenticate middleware  →  resolves session into req.auth (AuthContext)
[2] requireRole("ADMIN")     →  rejects non-admin (route-level guard, defense-in-depth)
[3] Service-layer policy     →  `authorize(auth, policyFn)` — fine-grained access control
```

### 7.4 Permission Model

| Resource | Permissions |
|---|---|
| `*:*` | SUPERADMIN only (wildcard) |
| `product:*` | ADMIN |
| `order:*` | ADMIN |
| `order:read` | EMPLOYEE |
| `order:update` | EMPLOYEE |
| `order:confirm` | EMPLOYEE |
| `inventory:*` | ADMIN |
| `employee:*` | ADMIN |
| `payroll:*` | ADMIN |
| `customer:*` | ADMIN |

### 7.5 Policy Functions (Order-Level Access)

| Policy | Who Can |
|---|---|
| `OrderPolicies.create()` | SUPERADMIN, ADMIN, EMPLOYEE |
| `OrderPolicies.view(order)` | SUPERADMIN, ADMIN, or the EMPLOYEE assigned to that order |
| `OrderPolicies.update(order)` | SUPERADMIN, ADMIN, or the EMPLOYEE assigned to that order |
| `OrderPolicies.delete()` | SUPERADMIN or ADMIN |
| `OrderPolicies.confirm(order)` | SUPERADMIN, ADMIN, or the EMPLOYEE assigned to that order |
| `OrderPolicies.reject(order)` | SUPERADMIN, ADMIN, or the EMPLOYEE assigned to that order |
| `OrderPolicies.assign()` | SUPERADMIN or ADMIN |
| `OrderPolicies.viewAll()` | SUPERADMIN or ADMIN |
| `OrderPolicies.viewAssigned()` | SUPERADMIN, ADMIN, EMPLOYEE |
| `ProductPolicies.updateInventory()` | SUPERADMIN or ADMIN |

### 7.6 Login/Registration Flows

**Admin Signup:**
1. `POST /admin/signup` with `{ name, email, password }`
2. Checks if email is in `PendingAdmin` table (pre-approved emails)
3. Creates user, hashes password with Argon2, creates session
4. Returns session cookie + user info

**Employee Signup:**
1. Admin first adds email to `PendingEmployee` via `POST /admin/employee/add`
2. Employee signs up at `POST /employee/signup` with `{ name, email, phoneNumber, password }`
3. Checks against `PendingEmployee` table
4. Creates user, creates session
5. Returns session cookie

---

## 8. Employee Payroll System

### 8.1 Payment Types

| Type | ID | Logic |
|---|---|---|
| **Salary** | 1 | Fixed salary amount per period |
| **Per-Order** | 2 | Earnings = confirmed orders in period × perOrderRate |

### 8.2 Payroll Run Lifecycle

```
Admin previews payroll (POST /admin/payroll/preview)
    → Shows projected earnings for each employee
    ↓
Admin creates DRAFT run (POST /admin/payroll)
    → Creates PayrollRun (status: DRAFT) + PayrollRunItems (status: PENDING)
    ↓
Admin confirms run (POST /admin/payroll/:id/confirm)
    → Transitions items to INCLUDED and marks them CONFIRMED
    ↓
Admin marks as PAID (POST /admin/payroll/:id/paid)
    → Finalizes all items as PAID
```

### 8.3 Manual Payments

Admin can also create individual employee payments outside payroll runs via `POST /admin/employees/:id/payments`.

### 8.4 Payroll Preview Calculation

- **Salary employees:** Uses contract `salaryAmount`
- **Per-order employees:** Counts confirmed orders (`statusId=2`) in the date range × `perOrderRate`

---

## 9. Inventory Management

### 9.1 Stock Adjustments

Admin can adjust stock manually:
- `POST /admin/inventory/adjust` with `{ productId, action: "increase" | "decrease", amount }`

### 9.2 Low-Stock Alerts

- `GET /admin/inventory/low-stock?threshold=10`
- Returns all products where `quantityAvailable < threshold`
- Default threshold: `10`

### 9.3 Automatic Inventory Changes

| Event | Inventory Effect |
|---|---|
| Order confirmed (1→2) | Decrements each item's quantity atomically |
| Order cancelled from confirmed (2→3/5) | Increments each item's quantity (restores) |
| Order created (checkout/admin) | **No effect** — stock held until confirmation |

---

## 10. Response Envelope & Error Handling

### 10.1 Standard Response Format

All API responses follow this envelope:

```json
// Success
{ "success": true, "data": { ... } }

// Paginated
{ "success": true, "data": [ ... ], "meta": { "page": 1, "limit": 20, "total": 100 } }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human-readable message" } }

// Created
{ "success": true, "data": { ... } }  // status 201

// No Content
// status 204, no body
```

### 10.2 Error Codes & HTTP Statuses

| Error | Status | Code |
|---|---|---|
| Validation Error | 400 | `VALIDATION_ERROR` |
| Unauthorized (no auth) | 401 | `UNAUTHORIZED` |
| Forbidden | 403 | `FORBIDDEN` |
| Authorization Error | 403 | `AUTHORIZATION_ERROR` |
| Not Found | 404 | `NOT_FOUND` |
| Conflict | 409 | `CONFLICT` |
| Internal Server Error | 500 | `INTERNAL_ERROR` |

### 10.3 Known Error Details

| Scenario | Error |
|---|---|
| Out of stock at confirm | `InsufficientStockError` (custom error with productId, requested, available) |
| Product not found | `ProductNotFoundError` |
| Order not found | `OrderNotFoundError` |
| Empty data in request | `ValidationError` (Zod) |

---

## 11. Appendix: Source Code Map

For reference when exploring backend implementation details:

```
src/modules/ecom/
├── admin/                  # Admin controllers, services, repos
│   ├── controllers/
│   │   ├── auth.controller.ts        # Admin signup, login
│   │   ├── employee.controller.ts    # Employee mgmt, payroll
│   │   └── inventory.controller.ts   # Stock adjustments
│   ├── services/
│   │   ├── auth.service.ts           # Admin auth business logic
│   │   ├── employee.service.ts       # Employee/payroll business logic
│   │   └── inventory.service.ts      # Stock business logic
│   └── repo/
├── auth/                   # Auth/authorization infrastructure
│   ├── casl/                        # CASL ability factory (experimental)
│   ├── guards/                      # Route-level guards (role, permission)
│   ├── policies/                    # Policy definitions per resource
│   │   └── resources/               # order.policy.ts, product.policy.ts, etc.
│   ├── rbac/                        # RBAC context, matcher, service
│   ├── session/                     # Session management
│   └── utils/
├── customer/               # Public-facing customer logic
│   ├── customer.controller.ts
│   ├── customer.service.ts
│   ├── customer.repo.ts
│   └── customer.types.ts
├── employee/               # Employee-facing order logic
│   ├── controllers/
│   │   └── order.controller.ts
│   ├── services/
│   │   └── order.service.ts
│   └── repo/
├── order/                  # Order CRUD + status management
│   ├── order.controller.ts
│   ├── order.service.ts
│   ├── order.repo.ts
│   ├── order.types.ts
│   └── order.errors.ts
├── product/                # Product CRUD + public browsing
├── shared/                 # Cross-cutting (response, errors, logger)
├── validation/             # Zod schemas + validators
│   ├── schemas/
│   └── validators/
└── docs/                   # PRD, use cases, authorization report
    ├── prd.md
    ├── authorization-report.md
    ├── use-cases/
    └── plans/
```

Related backend files:

```
src/api/ecom/
├── ecom.route.ts           # All route definitions
└── ecom-api-spec.yaml      # OpenAPI 3.0 spec
```

---

## 12. Appendix: Key Business Rules Summary

| # | Rule |
|---|---|
| 1 | **COD only** — no payment is collected or processed by the system at any point |
| 2 | **Prices come from DB** — client-supplied prices in checkout are never trusted |
| 3 | **Stock is deferred** — decremented on confirmation, not on checkout |
| 4 | **Employees are assigned** by admin; employees can only act on their assigned orders |
| 5 | **Status 1 (Pending)** is the only confirmable/rejectable status for employees |
| 6 | **Cancelling a confirmed order** restores inventory |
| 7 | **Cart is client-side** — the backend has placeholder endpoints only |
| 8 | **Customer tracking** is by phone number, not by account |
| 9 | **Low-stock threshold** defaults to 10 |
| 10 | **Payroll** supports two payment models: salary and per-order commission |
