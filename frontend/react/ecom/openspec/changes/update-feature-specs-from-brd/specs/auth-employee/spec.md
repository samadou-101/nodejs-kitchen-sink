## ADDED Requirements

### Requirement: Employee can sign up if pre-approved by admin
The system SHALL allow employees to register only if their email was pre-added by an admin to the `PendingEmployee` table.

#### Scenario: Successful employee signup
- **WHEN** an employee submits the signup form with a pre-approved email, name, phone number, and password
- **THEN** the system sends `POST /api/ecom/employee/signup` and creates an authenticated session via the `sid` cookie

#### Scenario: Email not pre-approved
- **WHEN** the email has not been added by an admin
- **THEN** the system shows an error "You are not authorized to register. Contact your admin."

### Requirement: Employee can log in
The system SHALL allow employees to log in with email and password via cookie-based session.

#### Scenario: Successful employee login
- **WHEN** the employee submits valid email and password
- **THEN** the system sends `POST /api/ecom/employee/login` and creates a session; the employee is redirected to their assigned orders

#### Scenario: Invalid credentials
- **WHEN** the employee submits incorrect email or password
- **THEN** the system displays "Invalid email or password"

### Requirement: Logout clears the session
The system SHALL allow both admins and employees to log out.

#### Scenario: Logout
- **WHEN** the user clicks "Logout"
- **THEN** the session is cleared and the user is redirected to the login page
