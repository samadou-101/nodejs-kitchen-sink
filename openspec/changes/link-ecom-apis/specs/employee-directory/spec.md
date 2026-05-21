## ADDED Requirements

### Requirement: Backend provides employee listing endpoint
The system SHALL provide `GET /api/ecom/admin/employees` that returns all employees with their user details, payment type, and active contract information. This endpoint SHALL be protected by the `authenticate` and `requireRole("ADMIN")` guards.

#### Scenario: Admin lists all employees
- **WHEN** an authenticated admin sends a GET request to `/api/ecom/admin/employees`
- **THEN** the endpoint returns `{ success: true, data: [{ userId, name, email, phoneNumber, isActive, paymentType: { name }, contract: { salaryAmount, perOrderRate, effectiveFrom } }] }`

#### Scenario: Non-admin gets forbidden
- **WHEN** a user without the ADMIN role attempts to access the endpoint
- **THEN** the endpoint returns 403 Forbidden

#### Scenario: No employees exist
- **WHEN** no employees have been registered yet
- **THEN** the endpoint returns `{ success: true, data: [] }`

### Requirement: Frontend displays employee list
The system SHALL display all employees in the Employee Management page, showing name, email, phone, payment type, and status.

#### Scenario: Employee list loads
- **WHEN** an admin navigates to `/admin/employees`
- **THEN** the page fetches `GET /api/ecom/admin/employees` and renders a table with each employee's details
