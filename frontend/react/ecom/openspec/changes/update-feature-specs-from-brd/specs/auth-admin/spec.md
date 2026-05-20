## ADDED Requirements

### Requirement: Admin can sign up with pre-approved email
The system SHALL allow admins to register if their email is in the `PendingAdmin` table. The signup form collects name, email, and password.

#### Scenario: Successful admin signup
- **WHEN** a new admin submits the signup form with a pre-approved email
- **THEN** the system sends `POST /api/ecom/admin/signup` with `{ name, email, password }` and creates an authenticated session via the `sid` cookie

#### Scenario: Email not pre-approved
- **WHEN** the email is not in the pending admin list
- **THEN** the system shows the error returned by the backend (e.g., "Email not authorized for admin registration")

#### Scenario: Duplicate email
- **WHEN** an admin tries to register with an already-used email
- **THEN** the system shows a validation error

### Requirement: Admin can log in
The system SHALL allow admins to log in with email and password. The session is managed via a cookie (`sid`).

#### Scenario: Successful admin login
- **WHEN** the admin submits valid email and password
- **THEN** the system sends `POST /api/ecom/admin/login` and creates a session; the admin is redirected to the dashboard

#### Scenario: Invalid credentials
- **WHEN** the admin submits incorrect email or password
- **THEN** the system displays "Invalid email or password"

#### Scenario: Already authenticated
- **WHEN** the admin visits the login page but already has a valid session
- **THEN** the system redirects to the dashboard

### Requirement: Admin session carries auth context
The system SHALL expose the admin's auth context (userId, roleNames, permissions, isSuperAdmin) to the frontend for role-based UI rendering.

#### Scenario: Access auth context
- **WHEN** the admin is logged in
- **THEN** the frontend has access to `{ userId, roleNames, permissions, isSuperAdmin }` from the session
