## Why

The `GET /api/ecom/employee/orders` endpoint requires `employeeId` as a query parameter, but the auth middleware already resolves it from the session and attaches it to `req.auth.employeeId`. This causes a `VALIDATION_ERROR` on the frontend (`/employee` route) because the frontend doesn't — and shouldn't have to — redundantly pass `employeeId` as a query param.

## What Changes

- **Backend controller** (`src/modules/ecom/employee/controllers/order.controller.ts`): Read `employeeId` from `req.auth.employeeId` instead of `req.query.employeeId`
- **No frontend changes needed** — the existing `useAssignedOrders()` hook works correctly once the backend uses the session

## Capabilities

### New Capabilities
- *(none — this is a bug fix, not a new capability)*

### Modified Capabilities
- *(none — requirement behavior is unchanged, only the implementation)*

## Impact

- One file: `src/modules/ecom/employee/controllers/order.controller.ts`
- No API contract changes — the endpoint still returns assigned orders
- No database changes
- No frontend changes required
