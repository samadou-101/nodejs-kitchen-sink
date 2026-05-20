## ADDED Requirements

### Requirement: Admin can manage products (CRUD)
The system SHALL allow admins to create, update, and delete products and categories.

#### Scenario: Create product
- **WHEN** the admin fills the product form (name, description, price, categoryId, optional initialStock) and submits
- **THEN** the system sends `POST /api/ecom/product/create` and shows the new product in the list

#### Scenario: Update product
- **WHEN** the admin edits a product and submits
- **THEN** the system sends `POST /api/ecom/product/update` and shows updated product details

#### Scenario: Delete product
- **WHEN** the admin clicks "Delete" on a product and confirms
- **THEN** the system sends `DELETE /api/ecom/product/:id` and removes the product from the list

#### Scenario: Create category
- **WHEN** the admin fills the category form (name, description) and submits
- **THEN** the system sends `POST /api/ecom/category` and shows the new category

#### Scenario: Update category
- **WHEN** the admin edits a category name/description
- **THEN** the system sends `POST /api/ecom/category/update` and reflects the change

#### Scenario: Delete category
- **WHEN** the admin clicks "Delete" on a category
- **THEN** the system sends `DELETE /api/ecom/category/:id` and removes the category

### Requirement: Admin can manage orders
The system SHALL allow admins to view all orders (paginated, filterable by statusId, employeeId), create/update/delete orders, update order status, and assign/unassign employees.

#### Scenario: View all orders with filters
- **WHEN** the admin opens the order management page
- **THEN** the system fetches `GET /api/ecom/orders` with optional `statusId` and `employeeId` query params and displays a filterable, paginated table

#### Scenario: Assign employee to order
- **WHEN** the admin selects an employee and clicks "Assign" on an order
- **THEN** the system sends `PATCH /api/ecom/order/:id/employee` with `{ employeeId }` and the assignment is reflected

#### Scenario: Unassign employee from order
- **WHEN** the admin clicks "Unassign" on an order with an assigned employee
- **THEN** the system sends `PATCH /api/ecom/order/:id/employee/remove` and the employee field is cleared

#### Scenario: Update order status
- **WHEN** the admin changes the order status via a dropdown
- **THEN** the system sends `PATCH /api/ecom/order/:id/status` with the new `statusId`

### Requirement: Admin can manage employees
The system SHALL allow admins to add employee emails to a pending list, assign payment type (salary or per-order), and view performance.

#### Scenario: Add employee email to pending list
- **WHEN** the admin enters an email and submits
- **THEN** the system sends `POST /api/ecom/admin/employee/add` with `{ email }` and shows a success message

#### Scenario: Assign payment type
- **WHEN** the admin selects an employee and chooses "Salary" or "Per-Order" payment type
- **THEN** the system sends `POST /api/ecom/admin/employees/:id/payment-type` with the payment type

#### Scenario: View employee performance
- **WHEN** the admin clicks "Performance" on an employee
- **THEN** the system fetches `GET /api/ecom/admin/employees/:id/performance` and displays metrics

### Requirement: Admin can manage inventory
The system SHALL allow admins to adjust stock (increase/decrease) and view low-stock alerts.

#### Scenario: Adjust stock up
- **WHEN** the admin selects a product and enters a positive amount with action "increase"
- **THEN** the system sends `POST /api/ecom/admin/inventory/adjust` with `{ productId, action: "increase", amount }` and the stock count updates

#### Scenario: Adjust stock down
- **WHEN** the admin selects a product and enters a positive amount with action "decrease"
- **THEN** the system sends `POST /api/ecom/admin/inventory/adjust` with `{ productId, action: "decrease", amount }` and the stock count updates

#### Scenario: View low-stock alerts
- **WHEN** the admin navigates to low-stock view
- **THEN** the system fetches `GET /api/ecom/admin/inventory/low-stock?threshold=10` and displays products below threshold

### Requirement: Admin can manage payroll
The system SHALL allow admins to preview, create (DRAFT), confirm, and mark payroll runs as PAID. Supports two payment types: salary (fixed amount) and per-order (commission).

#### Scenario: Preview payroll run
- **WHEN** the admin sets a date range and optionally selects employees
- **THEN** the system sends `POST /api/ecom/admin/payroll/preview` with `{ startDate, endDate, employeeIds? }` and shows projected earnings

#### Scenario: Create payroll draft
- **WHEN** the admin confirms the preview
- **THEN** the system sends `POST /api/ecom/admin/payroll` and creates a DRAFT payroll run

#### Scenario: Confirm payroll run
- **WHEN** the admin clicks "Confirm" on a DRAFT payroll run
- **THEN** the system sends `POST /api/ecom/admin/payroll/:id/confirm` and transitions to CONFIRMED

#### Scenario: Mark payroll as paid
- **WHEN** the admin clicks "Mark as Paid" on a CONFIRMED payroll run
- **THEN** the system sends `POST /api/ecom/admin/payroll/:id/paid` and transitions to PAID

#### Scenario: View payroll runs
- **WHEN** the admin opens the payroll page
- **THEN** the system fetches `GET /api/ecom/admin/payroll` and lists all payroll runs with their status

#### Scenario: View single payroll run details
- **WHEN** the admin clicks a payroll run
- **THEN** the system fetches `GET /api/ecom/admin/payroll/:id` and shows individual employee items and their statuses
