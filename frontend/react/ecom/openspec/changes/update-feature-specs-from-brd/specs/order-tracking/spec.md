## ADDED Requirements

### Requirement: Customer can track orders by phone number
The system SHALL allow any visitor to look up their orders by providing their phone number. No authentication required.

#### Scenario: Track orders by phone
- **WHEN** the customer enters their phone number on the tracking page and submits
- **THEN** the system fetches `GET /api/ecom/orders/track?phone=<phone>` and displays a list of orders associated with that phone number

#### Scenario: No orders found
- **WHEN** no orders exist for the given phone number
- **THEN** the system displays "No orders found for this phone number"

#### Scenario: Loading state
- **WHEN** the order lookup is in progress
- **THEN** the system shows a loading indicator

### Requirement: Customer can view order details by ID
The system SHALL allow customers to view the full details of a specific order.

#### Scenario: View order detail
- **WHEN** the customer clicks an order from the tracking results
- **THEN** the system fetches `GET /api/ecom/orders/:id` and displays the order items, quantities, prices, current status, customer info, and dates

#### Scenario: Order not found
- **WHEN** the order ID does not exist (404 NOT_FOUND)
- **THEN** the system displays "Order not found"

### Requirement: Order status is displayed with human-readable label
The system SHALL map `orderStatusId` (1-5) to human-readable labels: 1=Pending, 2=Confirmed, 3=Shipped, 4=Delivered, 5=Cancelled.

#### Scenario: Display order status
- **WHEN** viewing an order
- **THEN** the status is shown as a human-readable badge (e.g., "Pending", "Confirmed", "Cancelled")
