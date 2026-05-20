## ADDED Requirements

### Requirement: HTTP client parses the response envelope
The system SHALL provide a shared HTTP client that wraps `fetch`, includes `credentials: "include"` for cookie-based auth, and parses the `{ success, data, error }` response envelope. On `success: false`, it throws a typed error with the `code` and `message`.

#### Scenario: Successful response parsing
- **WHEN** the API returns `{ success: true, data: { ... } }`
- **THEN** the HTTP client returns the `data` field directly

#### Scenario: Error response parsing
- **WHEN** the API returns `{ success: false, error: { code: "NOT_FOUND", message: "Product not found" } }`
- **THEN** the HTTP client throws an error with `code` and `message` properties

#### Scenario: Paginated response parsing
- **WHEN** the API returns `{ success: true, data: [...], meta: { page: 1, limit: 20, total: 100 } }`
- **THEN** the HTTP client returns both `data` and `meta` for paginated endpoints

### Requirement: API errors map to user-friendly messages
The system SHALL provide an error mapping utility that converts backend error codes to user-facing messages.

#### Scenario: Map error codes
- **WHEN** the HTTP client throws an error with code `VALIDATION_ERROR`
- **THEN** the system displays the validation error message(s) from the backend
- **WHEN** the HTTP client throws an error with code `NOT_FOUND`
- **THEN** the system displays "The requested resource was not found"
- **WHEN** the HTTP client throws an error with code `FORBIDDEN` or `AUTHORIZATION_ERROR`
- **THEN** the system displays "You do not have permission to perform this action"
- **WHEN** the HTTP client throws an error with code `CONFLICT`
- **THEN** the system displays "This operation could not be completed due to a conflict"

### Requirement: Query key factory follows feature namespace convention
The system SHALL use a query key factory pattern where each feature prefixes its keys (e.g., `["products", ...]`, `["orders", ...]`, `["cart", ...]`) to avoid collisions.

#### Scenario: Query key structure
- **WHEN** a feature defines query keys
- **THEN** all keys start with the feature namespace (e.g., `["products", "list", { page, limit }]`, `["orders", "detail", id]`)

### Requirement: Tanstack Query is pre-configured globally
The system SHALL provide a `QueryClientProvider` wrapping the app with sensible defaults.

#### Scenario: Default configuration
- **WHEN** the app starts
- **THEN** Tanstack Query is configured with: stale time of 30 seconds, retry of 1 for failed queries, and `refetchOnWindowFocus: true`

### Requirement: Type definitions match backend models
The system SHALL define TypeScript types that mirror the backend data models for Product, Category, Order, OrderItem, AuthContext, Employee, PayrollRun, Inventory.

#### Scenario: Type alignment
- **WHEN** developing a feature
- **THEN** all API responses are typed using the shared type definitions that match the backend models documented in BRD.md

### Requirement: Folder structure follows three-layer pattern
The system SHALL enforce the `features/<name>/{api,hooks,components}/` structure for every feature. The `api/` layer owns all Tanstack Query hooks. The `hooks/` layer orchestrates API calls and client state. The `components/` layer only receives data via props or feature hooks.

#### Scenario: API layer isolation
- **WHEN** implementing a new feature
- **THEN** the `api/` folder contains all `useQuery` and `useMutation` hooks
- **THEN** the `hooks/` folder contains hooks that consume `api/` hooks and combine with client state
- **THEN** the `components/` folder contains UI components that never import from `api/` directly

### Requirement: Auth API calls include credentials
The system SHALL set `credentials: "include"` on all fetch requests so the `sid` cookie is sent with every request.

#### Scenario: Auth header handling
- **WHEN** any API request is made
- **THEN** the HTTP client automatically includes `credentials: "include"` for cookie-based session auth
