## Context

The backend Express server runs on port 3000 with all ecom routes mounted at `/api/ecom`. Auth is cookie-based (`sid` cookie) with Redis caching + PostgreSQL persistence. The frontend Vite dev server runs on port 5173. Currently there is no proxy, no CORS, and no way for the frontend to reach the backend in development.

The frontend already has a complete API client (`http-client.ts`) that sends `credentials: "include"` and parses the `{ success, data, error }` envelope. Three backend endpoints that the frontend depends on do not exist (`/auth/me`, `/logout`, `/admin/employees`). Additionally, the frontend TypeScript types were written from the BRD and don't match the actual Prisma-based API response shapes.

## Goals / Non-Goals

**Goals:**
- Frontend can call the backend in development via Vite proxy
- Backend accepts cross-origin requests from Vite dev server for testing without proxy (or direct production access)
- Auth state survives page refresh via `/auth/me` endpoint
- Users can log out and revoke sessions
- Admin Employee Management page can list all employees
- Frontend types match actual backend API response shapes exactly

**Non-Goals:**
- Production deployment infrastructure (Docker, reverse proxy config)
- Server-side cart implementation (remains client-side)
- Backend type generation for frontend consumption (no shared package)
- Full end-to-end testing setup

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Vite proxy vs CORS-only | **Both**: Vite proxy for dev convenience + CORS for direct access | Proxy avoids CORS in dev and matches production same-origin pattern. CORS allows testing with tools and production setups where FE/BE are on different origins. |
| `/auth/me` approach | Reuse existing `authenticate` middleware, return `req.auth` | `authenticate` already resolves the `sid` cookie to an `AuthContext` and attaches it to `req`. No new session logic needed — just expose what's already computed. |
| `/logout` session revocation | Use `sessionService.revokeSession(sid)`, clear cookie, ignore missing sessions | The session service already has `revokeSession` (removes from Redis + deletes from DB). Logout should be idempotent — if session is already gone, return success. |
| `/admin/employees` response shape | Return `EmployeeData[]` with `user`, `paymentType`, `activeContract` included | The Employee Management page needs employee names, emails, phone numbers, payment types, and contract details. Using Prisma includes avoids N+1. |
| Type alignment approach | Audit each frontend type against actual backend JSON, not Prisma schema | The API responses include Prisma relations in specific shapes. Frontend types must match the JSON that hits the wire, not the raw Prisma model. |
| Auth login/signup response | Keep backend returning `{ name, email }` + `sid` cookie; frontend follows up with `/auth/me` | The `AuthContext` is already computed during login — we could return it directly. But keeping the existing response and adding `/auth/me` is less invasive and follows a clear pattern: session creation sets cookie, session resolution reads it. |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `/auth/me` creates a backend dependency on every page load (SPA will fire it on mount) | The frontend `useAuthSession` already has `staleTime: 5 * 60 * 1000` — it caches the result for 5 minutes. No additional risk. |
| Type mismatch in nested relations (e.g., `orderItems[].product` shape) | Audit each endpoint's actual response shape by looking at Prisma `include` clauses in the repo files, not by guessing. |
| CORS configuration exposes backend in dev | CORS is restricted to the Vite dev server origin (e.g., `http://localhost:5173`) with `credentials: true`. Production will use same-origin via reverse proxy. |
| `SessionData` type fix could break Redis cache reads if old cached data uses old field names | The `createdAT` and `expires_at` fields are only used for cache metadata logging, not for business logic. Fixing the type won't break reads, but old cached entries will have extra/missing fields benignly. |
| `GET /admin/employees` without pagination could return many rows | For MVP, return all active employees. Add pagination if needed later — same pattern as `GET /orders`. |
