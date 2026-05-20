## ADDED Requirements

### Requirement: Customer can register
The system SHALL allow new customers to create an account.

#### Scenario: Successful registration
- **WHEN** a new customer submits the registration form with valid name, email, and password
- **THEN** the system creates the account and automatically signs the customer in

#### Scenario: Duplicate email
- **WHEN** a customer tries to register with an email that already exists
- **THEN** the system shows an error: "An account with this email already exists"

### Requirement: Customer can log in and log out
The system SHALL allow customers to authenticate and end their session.

#### Scenario: Successful login
- **WHEN** a customer submits valid credentials
- **THEN** the system authenticates the customer and redirects to the home page

#### Scenario: Invalid credentials
- **WHEN** a customer submits incorrect email or password
- **THEN** the system shows an error: "Invalid email or password"

#### Scenario: Logout
- **WHEN** a customer clicks "Logout"
- **THEN** the system ends the session and redirects to the login page

### Requirement: Auth state is globally accessible
The system SHALL expose the current authenticated user and authentication status to all components via context.

#### Scenario: Protected route redirect
- **WHEN** an unauthenticated customer tries to access a protected page (cart, checkout, orders)
- **THEN** the system redirects to the login page
