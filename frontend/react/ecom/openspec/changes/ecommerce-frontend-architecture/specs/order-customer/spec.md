## ADDED Requirements

### Requirement: Customer can place a COD order
The system SHALL allow authenticated customers to place a Cash on Delivery (COD) order from their cart.

#### Scenario: Place order successfully
- **WHEN** the customer proceeds to checkout and confirms the order
- **THEN** the system creates the order with status "pending", clears the cart, and shows an order confirmation with an order reference number

#### Scenario: Empty cart checkout
- **WHEN** the customer tries to checkout with an empty cart
- **THEN** the system shows an error message: "Your cart is empty"

### Requirement: Customer can view order confirmation
The system SHALL display an order confirmation page immediately after placing an order.

#### Scenario: View confirmation
- **WHEN** the order is placed successfully
- **THEN** the system shows the order reference number, items ordered, total amount, and a message that an employee will call to confirm

### Requirement: Customer can view order history
The system SHALL allow customers to view their past orders.

#### Scenario: View order history
- **WHEN** the customer navigates to "My Orders"
- **THEN** the system displays a list of past orders with date, status, and total

#### Scenario: Empty order history
- **WHEN** the customer has no past orders
- **THEN** the system displays "No orders yet"

### Requirement: Customer can view order details
The system SHALL allow customers to view the details of a specific order.

#### Scenario: View single order
- **WHEN** the customer clicks an order from their history
- **THEN** the system displays the full order details: items, quantities, prices, current status, and delivery address

### Requirement: Order statuses follow a defined lifecycle
The system SHALL track orders through statuses: pending → confirmed → shipped → delivered. Cancellation is allowed only when status is pending or confirmed.

#### Scenario: Track order status
- **WHEN** the customer views their order
- **THEN** the current status and last update timestamp are displayed
