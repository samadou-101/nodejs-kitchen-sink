## 1. Backend Infrastructure

- [ ] 1.1 Add `cors` middleware to `src/app.ts` allowing `http://localhost:5173` with `credentials: true`
- [ ] 1.2 Fix `SessionData` type in `src/modules/ecom/auth/session/session.types.ts`: rename `createdAT` → `createdAt`, `expires_at` → `expiresAt`

## 2. Backend — Session Restore Endpoint

- [ ] 2.1 Add `GET /api/ecom/auth/me` route to `src/api/ecom/ecom.route.ts` using the `authenticate` middleware
- [ ] 2.2 Create a `session.controller.ts` in `src/modules/ecom/auth/` that delegates to the existing `authenticate` middleware and returns `req.auth`
- [ ] 2.3 No authentication guard needed — the endpoint itself checks the session; return 401 with `UNAUTHORIZED` if no valid session

## 3. Backend — Logout Endpoint

- [ ] 3.1 Add `POST /api/ecom/logout` route to `src/api/ecom/ecom.route.ts` (no auth guard — idempotent)
- [ ] 3.2 Create logout handler that reads `sid` cookie, calls `sessionService.revokeSession(sid)`, clears the cookie, returns success

## 4. Backend — Employee Directory Endpoint

- [ ] 4.1 Add `GET /api/ecom/admin/employees` route to `src/api/ecom/ecom.route.ts` with admin auth guard
- [ ] 4.2 Add `getAllEmployees` method to `admin/employee.repo.ts` querying `employee` with `include: { user: true, paymentType: true, contracts: { where: { isActive: true } } }`
- [ ] 4.3 Add `listEmployees` method to `admin/employee.service.ts` calling the repo
- [ ] 4.4 Add handler in `admin/controllers/employee.controller.ts` for the `/admin/employees` path

## 5. Frontend — Dev Proxy & API URL

- [ ] 5.1 Add `server.proxy` to `frontend/react/ecom/vite.config.ts`: `/api` → `http://localhost:3000`
- [ ] 5.2 Add `VITE_API_URL` environment variable support to `frontend/react/ecom/src/shared/api/http-client.ts` — prepend it to all request URLs when set

## 6. Frontend — Type Audit & Alignment

- [ ] 6.1 Audit product endpoint responses: update `Product` type to use `productId` (not `id`), add `inventory` and `category` relations
- [ ] 6.2 Audit order endpoint responses: create separate types for admin list order (rich), admin single order (flat), employee order (rich with relations)
- [ ] 6.3 Update `OrderItem` type to include `product` relation when present
- [ ] 6.4 Update `Category` type to match Prisma: `categoryId`, `name`, `description` (remove `id`)
- [ ] 6.5 Add `OrderStatus` type with `orderStatusId`, `name`, `description`
- [ ] 6.6 Update `Employee` type to remove `password` field (not exposed by API) and match actual response shape
- [ ] 6.7 Audit all feature API hooks for type correctness against real response shapes

## 7. Frontend — Auth Flow Fixes

- [ ] 7.1 Update `useAuthSession` to call `GET /api/ecom/auth/me` and parse `AuthContext` response
- [ ] 7.2 Update `useLogout` to call `POST /api/ecom/logout` and handle success/idempotent response
- [ ] 7.3 Update login/signup hooks to first call the auth endpoint, then call `/auth/me` to get the full `AuthContext`
- [ ] 7.4 Update `AuthProvider` to handle the loading/authenticated/unauthenticated states from `/auth/me`

## 8. Frontend — Employee List

- [ ] 8.1 Update `useListEmployees` hook to call `GET /api/ecom/admin/employees` and parse the employee list response
- [ ] 8.2 Verify `EmployeeManagement` component renders correctly with the backend data shape
