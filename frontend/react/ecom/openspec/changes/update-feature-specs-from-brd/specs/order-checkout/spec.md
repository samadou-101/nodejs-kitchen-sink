## ADDED Requirements

### Requirement: Customer can place a COD order without authentication
The system SHALL allow any visitor to place a COD order. No login is required. The customer provides name, phone, address, city, optional notes, and cart items. Backend fetches current prices from the database (client prices are not trusted).

#### Scenario: Successful checkout
- **WHEN** the customer fills the checkout form (name, phone, address, city) and submits
- **THEN** the system sends `POST /api/ecom/checkout` with `{ name, phone, address, city, notes?, items: [{ productId, quantity }] }` and displays the order confirmation with the returned order ID

#### Scenario: Validation error from backend
- **WHEN** the required fields are missing or invalid
- **THEN** the system shows the validation errors returned by the backend (400 VALIDATION_ERROR)

#### Scenario: Empty cart checkout
- **WHEN** the customer tries to submit checkout with an empty cart
- **THEN** the system shows a client-side error "Your cart is empty" without making an API call

### Requirement: Checkout form mirrors backend validation
The system SHALL validate form fields client-side matching the backend Zod schemas: `name` (required), `phone` (required), `address` (required), `city` (required), `items` (min 1).

#### Scenario: Required field validation
- **WHEN** the customer tries to submit with an empty required field
- **THEN** the field is highlighted with an error message before any API call

#### Scenario: Minimum items validation
- **WHEN** the customer has zero items in cart
- **THEN** the checkout button is disabled with a message "Add items to your cart first"
