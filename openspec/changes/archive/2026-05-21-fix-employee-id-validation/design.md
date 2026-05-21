## Context

The `employeeOrderHandler` controller for `GET /api/ecom/employee/orders` currently requires `employeeId` as a query parameter (`req.query.employeeId`). However, the `authenticate` middleware — which runs before the handler — already resolves the employee's ID from the database during session validation and stores it at `req.auth.employeeId`.

The frontend calls this endpoint at `GET /api/ecom/employee/orders` without any query params (as it should, since the server knows who the authenticated user is), triggering the validation error.

## Goals / Non-Goals

**Goals:**
- Fix the 400 `VALIDATION_ERROR` on the `/employee` frontend route
- Use the already-available `req.auth.employeeId` instead of requiring a query parameter

**Non-Goals:**
- No API contract changes (the endpoint still returns assigned orders for the authenticated employee)
- No frontend changes
- No database or schema changes

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Where to read `employeeId` | `req.auth.employeeId` | Auth middleware already resolves it; eliminates redundant client input and prevents frontend/backend mismatch |
| Query param fallback | Not needed | Employee orders should only be accessible for the authenticated employee — admin routes use a different handler with explicit employee ID params |

## Risks / Trade-offs

- **[Low] Endpoint coupling to auth** — The endpoint now depends on `req.auth` being populated. The `authenticate` + `requireRole("EMPLOYEE")` middleware chain already guarantees this, so no real risk.
- **[Low] Admin usage unaffected** — Admin endpoints that need to query orders for a specific employee (e.g., manager viewing team orders) use a different handler and are not affected.
