## ADDED Requirements

### Requirement: Backend provides session restore endpoint
The system SHALL provide `GET /api/ecom/auth/me` that reads the `sid` cookie, validates the session, and returns the authenticated user's `AuthContext` (userId, employeeId, roleNames, permissions, isSuperAdmin).

#### Scenario: Valid session returns auth context
- **WHEN** a request is made with a valid `sid` cookie
- **THEN** the endpoint returns `{ success: true, data: { userId, employeeId, roleNames, permissions, isSuperAdmin } }`

#### Scenario: Missing or expired session returns error
- **WHEN** a request is made without a `sid` cookie or with an expired/revoked session
- **THEN** the endpoint returns `{ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }` with status 401

### Requirement: Frontend restores auth state on page load
The system SHALL call `GET /api/ecom/auth/me` on application mount to restore the user's authentication state from the existing session cookie.

#### Scenario: Authenticated user refreshes the page
- **WHEN** the user has a valid session and refreshes the page
- **THEN** the frontend calls `/api/ecom/auth/me`, receives the `AuthContext`, and the user remains authenticated without re-logging in

#### Scenario: Unauthenticated user refreshes the page
- **WHEN** the user has no valid session and refreshes the page
- **THEN** the frontend calls `/api/ecom/auth/me`, receives a 401 error, and the user stays in the unauthenticated state
