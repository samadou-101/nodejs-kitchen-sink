## ADDED Requirements

### Requirement: Backend provides logout endpoint
The system SHALL provide `POST /api/ecom/logout` that reads the `sid` cookie, revokes the session (removes from Redis cache and deletes from PostgreSQL), and clears the cookie.

#### Scenario: Successful logout
- **WHEN** an authenticated user sends a POST request to `/api/ecom/logout`
- **THEN** the session is revoked in Redis and PostgreSQL, the `sid` cookie is cleared, and the endpoint returns `{ success: true, data: { message: "Logged out successfully" } }`

#### Scenario: Logout with no active session
- **WHEN** a request is made to `/api/ecom/logout` without a valid `sid` cookie
- **THEN** the endpoint still returns success (idempotent) with `{ success: true, data: { message: "Logged out successfully" } }`

### Requirement: Frontend clears auth state on logout
The system SHALL call `POST /api/ecom/logout` when the user clicks "Logout", then clear all cached query data and redirect to the public home page.

#### Scenario: User clicks logout
- **WHEN** an authenticated user clicks the logout button
- **THEN** the frontend sends `POST /api/ecom/logout`, clears the TanStack Query cache, sets auth state to null, and redirects to `/`

#### Scenario: Matching backend error
- **WHEN** the logout API call fails (network error, server error)
- **THEN** the frontend still clears local auth state and redirects, ensuring the user is logged out locally even if the server-side session revocation fails
