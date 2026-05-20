## Why

The previous feature specs were based on assumptions about the backend. Now that the backend BRD is available — documenting the exact API endpoints, data models, auth model (cookie-based sessions, no customer auth), order lifecycle (deferred stock, COD only), and role structure (public, EMPLOYEE, ADMIN, SUPERADMIN) — the frontend specs must be regenerated to match the real backend. Building against inaccurate specs would cause costly rework.

## What Changes

- Update all feature specs to match the backend API endpoints, request/response shapes, and validation rules documented in BRD.md
- Remove `customer-auth` — customers have no authentication; they are tracked by phone number
- Add `auth-admin` and `auth-employee` as separate capabilities (cookie-based session auth)
- Add `order-tracking` — public order lookup by phone number
- Add `admin-dashboard` — comprehensive admin panel covering products, categories, orders, employees, inventory, and payroll
- Add `employee-orders` — employee order confirmation/rejection workflow
- Update `product-catalog` specs to match pagination (page/limit), search (name/description), and category filtering APIs
- Update `shopping-cart` specs to reflect client-side-only cart with placeholder backend endpoints
- Update `order-checkout` (was `order-customer`) to require no auth and use public checkout endpoint
- **BREAKING**: `customer-auth` capability is removed (no customer login exists)

## Capabilities

### New Capabilities
- `product-catalog`: Public product browsing — paginated list, search by name/description, category filter, product detail
- `shopping-cart`: Client-side cart with localStorage persistence; backend endpoints are placeholders
- `order-checkout`: Public COD checkout — customer fills name/phone/address/city/items, backend creates order (no auth)
- `order-tracking`: Public order status lookup by phone number via `GET /orders/track?phone=xxx`
- `auth-admin`: Admin signup (pre-approved email) and login via cookie-based session
- `auth-employee`: Employee signup (pre-approved by admin) and login via cookie-based session
- `admin-dashboard`: Full admin panel — product/category CRUD, order management (view all, assign, update status), employee management (add to pending, payment type, performance), inventory adjustments, low-stock alerts, payroll management
- `employee-orders`: Employee view of assigned orders, confirm (with atomic stock decrement), reject with notes
- `feature-architecture`: Shared patterns — HTTP client with response envelope parsing, query key factory, Tanstack Query setup, type definitions matching backend models, folder structure conventions

### Modified Capabilities
<!-- No existing main specs to modify — all change-specific specs are in the previous change -->

## Impact

- No customer auth UI (no register/login for customers)
- Two separate auth flows: admin and employee (both cookie-based)
- Cart is entirely client-side — no server-side cart sync
- All API calls must parse the `{ success, data, error }` response envelope
- Error handling must map backend error codes (VALIDATION_ERROR, NOT_FOUND, InsufficientStockError, etc.)
- Order confirmation flow must handle the deferred stock model (InsufficientStockError possible at confirm time)
