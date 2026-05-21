## 1. Backend Infrastructure

- [x] 1.1 Add `cors` middleware to `src/app.ts` allowing `http://localhost:5173` with `credentials: true`
- [x] 1.2 Fix `SessionData` type in `src/modules/ecom/auth/session/session.types.ts`: rename `createdAT` → `createdAt`, `expires_at` → `expiresAt`

## 2. Backend — Session Restore Endpoint

- [x] 2.1 Add `GET /api/ecom/auth/me` route to `src/api/ecom/ecom.route.ts` using the `authenticate` middleware
- [x] 2.2 Create a `session.controller.ts` in `src/modules/ecom/auth/` that delegates to the existing `authenticate` middleware and returns `req.auth`
- [x] 2.3 No authentication guard needed — the endpoint itself checks the session; return 401 with `UNAUTHORIZED` if no valid session

## 3. Backend — Logout Endpoint

- [x] 3.1 Add `POST /api/ecom/logout` route to `src/api/ecom/ecom.route.ts` (no auth guard — idempotent)
- [x] 3.2 Create logout handler that reads `sid` cookie, calls `sessionService.revokeSession(sid)`, clears the cookie, returns success

## 4. Backend — Employee Directory Endpoint

- [x] 4.1 Add `GET /api/ecom/admin/employees` route to `src/api/ecom/ecom.route.ts` with admin auth guard
- [x] 4.2 Add `getAllEmployees` method to `admin/employee.repo.ts` querying `employee` with `include: { user: true, paymentType: true, contracts: { where: { isActive: true } } }`
- [x] 4.3 Add `listEmployees` method to `admin/employee.service.ts` calling the repo
- [x] 4.4 Add handler in `admin/controllers/employee.controller.ts` for the `/admin/employees` path

## 5. Frontend — Dev Proxy & API URL

- [x] 5.1 Add `server.proxy` to `frontend/react/ecom/vite.config.ts`: `/api` → `http://localhost:3000`
- [x] 5.2 Add `VITE_API_URL` environment variable support to `frontend/react/ecom/src/shared/api/http-client.ts` — prepend it to all request URLs when set

## 6. Frontend — Type Audit & Alignment

- [x] 6.1 Audit product endpoint responses: update `Product` type to use `productId` (not `id`), add `inventory` and `category` relations
- [x] 6.2 Audit order endpoint responses: create separate types for admin list order (rich), admin single order (flat), employee order (rich with relations)
- [x] 6.3 Update `OrderItem` type to include `product` relation when present
- [x] 6.4 Update `Category` type to match Prisma: `categoryId`, `name`, `description` (remove `id`)
- [x] 6.5 Add `OrderStatus` type with `orderStatusId`, `name`, `description`
- [x] 6.6 Update `Employee` type to remove `password` field (not exposed by API) and match actual response shape
- [x] 6.7 Audit all feature API hooks for type correctness against real response shapes

## 7. Frontend — Auth Flow Fixes

- [x] 7.1 Update `useAuthSession` to call `GET /api/ecom/auth/me` and parse `AuthContext` response
- [x] 7.2 Update `useLogout` to call `POST /api/ecom/logout` and handle success/idempotent response
- [x] 7.3 Update login/signup hooks to first call the auth endpoint, then call `/auth/me` to get the full `AuthContext`
- [x] 7.4 Update `AuthProvider` to handle the loading/authenticated/unauthenticated states from `/auth/me`

## 8. Frontend — Employee List

- [x] 8.1 Update `useListEmployees` hook to call `GET /api/ecom/admin/employees` and parse the employee list response
- [x] 8.2 Verify `EmployeeManagement` component renders correctly with the backend data shape
