## ADDED Requirements

### Requirement: Employee can view pending orders
The system SHALL allow employees to see a list of all orders that need confirmation.

#### Scenario: View pending orders
- **WHEN** an employee navigates to the order management dashboard
- **THEN** the system displays all orders with status "pending", sorted by creation date (oldest first)

#### Scenario: No pending orders
- **WHEN** there are no pending orders
- **THEN** the system displays "No pending orders"

### Requirement: Employee can confirm an order after phone call
The system SHALL allow an employee to mark an order as "confirmed" after calling the customer.

#### Scenario: Confirm order
- **WHEN** an employee clicks "Confirm" on a pending order
- **THEN** the system updates the order status to "confirmed" and shows a success message

### Requirement: Employee can cancel an order
The system SHALL allow an employee to cancel a pending or confirmed order.

#### Scenario: Cancel order
- **WHEN** an employee clicks "Cancel" on an order
- **THEN** the system updates the order status to "cancelled" and shows a confirmation
