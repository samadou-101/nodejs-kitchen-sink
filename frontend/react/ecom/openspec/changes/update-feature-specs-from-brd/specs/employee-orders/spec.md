## ADDED Requirements

### Requirement: Employee can view assigned orders
The system SHALL display only the orders assigned to the logged-in employee. No other orders are visible.

#### Scenario: View assigned orders
- **WHEN** the employee navigates to their orders page
- **THEN** the system fetches `GET /api/ecom/employee/orders` and displays a list of orders assigned to them, sorted by creation date (oldest first)

#### Scenario: View single assigned order detail
- **WHEN** the employee clicks an order
- **THEN** the system fetches `GET /api/ecom/employee/orders/:id` and displays full order details including items, quantities, prices, customer info, and status

#### Scenario: No assigned orders
- **WHEN** the employee has no assigned orders
- **THEN** the system displays "No orders assigned to you"

### Requirement: Employee can confirm an assigned order
The system SHALL allow employees to confirm an order (Pending → Confirmed). This triggers atomic inventory decrement on the backend and may fail with InsufficientStockError.

#### Scenario: Successful confirmation
- **WHEN** the employee clicks "Confirm" on a pending assigned order and stock is sufficient
- **THEN** the system sends `PATCH /api/ecom/employee/orders/:id/confirm` and the order status changes to "Confirmed" (statusId: 2)

#### Scenario: Insufficient stock at confirmation
- **WHEN** the employee clicks "Confirm" but stock has run out
- **THEN** the system shows the `InsufficientStockError` message returned by the backend, including which product(s) are low and the available quantity

### Requirement: Employee can reject an assigned order
The system SHALL allow employees to reject an order (Pending → Cancelled). No inventory side effects.

#### Scenario: Successful rejection
- **WHEN** the employee clicks "Reject" on a pending assigned order
- **THEN** the system sends `PATCH /api/ecom/employee/orders/:id/reject` and the order status changes to "Cancelled" (statusId: 5)

### Requirement: Employee can add notes to an order
The system SHALL allow employees to add confirmation notes to an assigned order.

#### Scenario: Add notes
- **WHEN** the employee writes a note and submits
- **THEN** the system sends `POST /api/ecom/employee/orders/:id/notes` with `{ notes: "..." }` and the note is saved
