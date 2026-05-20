## Why

The current frontend is a blank slate with no architectural foundation. Without a clear, feature-based structure that enforces separation of concerns between data fetching, state logic, and UI, the codebase will quickly become tangled, hard to test, and difficult to maintain. This change establishes a repeatable, opinionated architecture so every feature follows the same predictable pattern.

## What Changes

- Introduce a feature-based folder structure under `src/features/<name>/` with three layers per feature: `api/` (Tanstack Query data fetching), `hooks/` (state/business logic), and `components/` (UI)
- Add Tanstack Query (`@tanstack/react-query`) as the data fetching layer with provider setup
- Add Vitest and Testing Library for unit/component testing
- Set up shared/lib utilities (HTTP client, query key factory, type helpers)
- Create the initial set of features: product catalog, shopping cart, COD order flow, and employee order confirmation
- Establish strict import rules: UI never imports API directly, hooks mediate between them

## Capabilities

### New Capabilities
- `product-catalog`: Product listing, search/filter, and product detail views
- `shopping-cart`: Add/remove items, update quantities, cart persistence
- `order-customer`: COD order placement, order confirmation page, order history
- `order-admin`: Employee dashboard to view pending orders and mark orders as confirmed after phone call
- `customer-auth`: Customer registration, login, and session management
- `feature-architecture`: Shared patterns — query client setup, query key factory, HTTP client, type conventions, folder structure conventions

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- New dependencies: `@tanstack/react-query`, `@tanstack/react-query-devtools`, `vitest`, `@testing-library/react`, `msw` (for API mocking in tests)
- `src/` restructured — existing `components/`, `hooks/`, `lib/` folders become feature-based, with shared code promoted to `src/shared/`
- All new code follows the three-layer pattern; no UI component directly calls Tanstack Query hooks
