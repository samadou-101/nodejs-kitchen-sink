## Context

The project is a React 19 ecommerce frontend with Tailwind CSS v4, Base UI, and Shadcn. Currently `src/` has flat `components/`, `hooks/`, `lib/` folders with no feature boundaries. The backend follows a COD-only model where employees confirm orders by phone — there is no online payment. We need a scalable, testable architecture before the first feature ships.

## Goals / Non-Goals

**Goals:**
- Define a feature-based folder convention (`src/features/<name>/` with `api/`, `hooks/`, `components/` subfolders)
- Integrate Tanstack Query as the sole server-state layer with a shared query client and provider
- Set up Vitest + Testing Library + MSW for testing
- Build the shared primitives: HTTP client, query key factory, type helpers
- Implement the first 5 features (product-catalog, shopping-cart, order-customer, order-admin, customer-auth) using the pattern

**Non-Goals:**
- Not implementing online payment or payment gateway integration
- Not covering the employee call workflow beyond order status updates (the actual phone call is outside the system)
- Not building an admin panel beyond order confirmation

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | Tanstack Query + React state (no Redux/Zustand) | Only server state needs external management; Tanstack Query handles caching, refetching, and optimistic updates. Client-only state (cart, UI toggles) lives in hooks with `useState`/`useReducer`. |
| HTTP client | Native `fetch` wrapped in a thin utility | Avoids adding Axios; native fetch is sufficient with a small wrapper for base URL, headers, and error handling. |
| Query key factory | Centralized `queryKeys` object per feature | Ensures cache invalidation is predictable and co-located with the API layer. |
| Folder structure | `features/<name>/{api,hooks,components}/` | Each feature is a self-contained module. The `api/` layer owns all Tanstack Query hooks (useQuery, useMutation). The `hooks/` layer orchestrates multiple queries or client state. The `components/` layer only receives data via props or feature hooks — never calls `useQuery` directly. |
| Shared code | `src/shared/` with `api/`, `hooks/`, `components/`, `lib/` subfolders | Cross-cutting concerns (HTTP client, auth context, UI primitives) live in shared to avoid circular deps. |
| Testing | Vitest + Testing Library + MSW | MSW intercepts network calls so feature tests don't need a running backend. |
| Auth | JWT-based, token stored in memory (not localStorage) | More secure; refresh handled via httpOnly cookie to the backend. Auth state managed via React context in `shared/hooks/`. |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Feature folders become too large | If a feature exceeds ~10 files, split into sub-features (e.g., `features/order/customer/` and `features/order/admin/`) |
| Circular imports between features | Enforce lint rule: features cannot import from other features' internals; only shared code is importable across boundaries |
| Over-abstraction in early stage | Start concrete — generate the pattern by copying boilerplate. Extract shared utilities only after 3+ features need them |
| Query key collisions | Use a namespace per feature (e.g., `["products", ...]`, `["cart", ...]`) enforced by the factory pattern |
