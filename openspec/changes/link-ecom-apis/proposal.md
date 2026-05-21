## Why

The frontend React app and the backend Express API have been built independently — the frontend defines API calls and types that were designed from the BRD, but the actual connection layer (proxy, CORS, missing endpoints, type alignment) was never implemented. Running the frontend against the real backend will fail on session restore, logout, employee listing, and type mismatches. This change bridges the gap to make the frontend and backend actually work together in development.

## What Changes

- **Backend**: Add `GET /api/ecom/auth/me` endpoint to restore sessions on page refresh
- **Backend**: Add `POST /api/ecom/logout` endpoint to revoke sessions
- **Backend**: Add `GET /api/ecom/admin/employees` endpoint to list all employees
- **Backend**: Configure CORS to accept requests from the Vite dev server origin
- **Backend**: Fix `SessionData` type typo (`createdAT` → `createdAt`) and casing (`expires_at` → `expiresAt`)
- **Frontend**: Configure Vite dev proxy to forward `/api/*` to the backend
- **Frontend**: Add `VITE_API_URL` environment variable support for production deploys
- **Frontend**: Align all TypeScript types (`Product`, `Order`, `OrderItem`, `AuthContext`, etc.) with actual backend API response shapes
- **Frontend**: Fix `useAuthSession` to use the new `/auth/me` endpoint
- **Frontend**: Fix `useLogout` to use the new `/logout` endpoint
- **Frontend**: Add `useListEmployees` hook now that the endpoint exists
- **Frontend**: Fix login/signup handlers to properly extract auth context from responses

## Capabilities

### New Capabilities
- `api-connection`: Vite dev proxy, CORS configuration, and `VITE_API_URL` env var for development connectivity between frontend and backend
- `session-resume`: Backend `GET /api/ecom/auth/me` endpoint that resolves the `sid` cookie to an `AuthContext` response, enabling the frontend to restore auth state on page refresh
- `logout`: Backend `POST /api/ecom/logout` endpoint that revokes the session in both Redis and PostgreSQL, plus frontend `useLogout` cleanup
- `employee-directory`: Backend `GET /api/ecom/admin/employees` endpoint returning all employees with their user details, payment types, and contracts
- `type-harmonization`: Audit and align all frontend TypeScript types with actual backend API response shapes — fix field names (`id` → `productId`), add missing relations, match Prisma conventions

### Modified Capabilities
<!-- No existing root-level specs to modify — this is the first change on the root openspec -->

## Impact

- **Backend**: Three new routes in `ecom.route.ts`, CORS middleware in `app.ts`, session service export for logout
- **Backend**: `SessionData` type fix in `auth/session/` affects Redis cache layer
- **Frontend**: Types file (`shared/lib/types.ts`) requires significant rewriting — every feature that uses these types may need updates
- **Frontend**: `http-client.ts` may need a base URL config option for production
- **Frontend**: `vite.config.ts` needs a `server.proxy` section
- **Frontend**: Auth flow changes — login/signup currently handles `{ name, email }` but backend returns `AuthContext` only from `/auth/me`
