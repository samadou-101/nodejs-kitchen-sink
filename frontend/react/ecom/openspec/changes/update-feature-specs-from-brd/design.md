## Context

The backend is fully built with Express + Prisma + PostgreSQL + Redis. It exposes a REST API at `/api/ecom` with three user personas: public (no auth), admin (ADMIN/SUPERADMIN roles), and employee (EMPLOYEE role). Auth uses cookie-based sessions (`sid` cookie). All responses follow a `{ success, data, error }` envelope. The frontend is a React 19 + Vite + Tailwind CSS v4 project with a flat structure — no features built yet.

Key backend constraints from BRD:
- **No customer auth** — customers are tracked by phone number
- **COD only** — no payment processing in the system
- **Deferred inventory** — stock decremented at order confirmation, not checkout
- **Cart is client-side** — backend has placeholder endpoints

## Goals / Non-Goals

**Goals:**
- Regenerate feature specs that precisely match the backend API endpoints, request/response shapes, error codes, and auth model
- Define 9 frontend features covering all three user personas (public, admin, employee)
- Each spec requirement maps to a testable scenario that a frontend test can verify
- All specs reference the actual API paths, status codes, and error types from the BRD

**Non-Goals:**
- No customer registration or login UI (no such backend capability)
- No payment form or payment gateway integration
- No delivery tracking UI beyond status display (not built yet on backend)

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth model | Two separate features: `auth-admin` and `auth-employee` | Backend has distinct signup/login flows (admin: pending approval table; employee: added by admin first). Cookie-based session means no token management on frontend. |
| Checkout | Public page, no auth guard | Backend `POST /checkout` is a public route. Customer provides name/phone/address/city. |
| Order tracking | Public page, lookup by phone | Backend `GET /orders/track?phone=xxx` is public. Single-page lookup, not a persisted session. |
| Cart storage | localStorage with React state | Backend cart endpoints are placeholders. Client-side cart with localStorage persistence means cart survives page reloads. |
| Admin dashboard | Single feature with sub-views | Rather than 6 separate features (products, categories, orders, employees, inventory, payroll), group under `admin-dashboard` with route-level sub-pages. All require ADMIN role. |
| Employee scope | Read assigned orders + confirm/reject | Employee has no access to product catalog management, payroll, etc. Feature is limited to the order confirmation workflow. |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Backend cart endpoints may evolve from placeholders | Keep cart logic in a single hook (`useCart`) so switching to server-side cart only changes the API layer, not components |
| InsufficientStockError at confirm time is hard to test | MSW handler must simulate this error; component must show the error message with product details |
| Admin dashboard becomes monolithic | Split into route-level sub-pages (`/admin/products`, `/admin/orders`, `/admin/payroll`, etc.) — each is a separate component group within the same feature folder |
| Cookie-based auth means no token refresh logic | Session is auto-extended by backend when within 3 days of expiry. Frontend just needs to include credentials in fetch calls. |
