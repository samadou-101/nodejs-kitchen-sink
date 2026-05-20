## ADDED Requirements

### Requirement: Customer can add items to cart
The system SHALL allow authenticated customers to add products to their shopping cart.

#### Scenario: Add product to cart
- **WHEN** the customer clicks "Add to Cart" on a product
- **THEN** the item is added to the cart and a brief confirmation toast is shown

#### Scenario: Add duplicate product
- **WHEN** the customer adds a product already in the cart
- **THEN** the quantity of that item is incremented instead of creating a duplicate entry

### Requirement: Customer can manage cart items
The system SHALL allow customers to view, update quantities, and remove items from the cart.

#### Scenario: Update quantity
- **WHEN** the customer changes the quantity of a cart item
- **THEN** the cart total updates accordingly

#### Scenario: Remove item
- **WHEN** the customer clicks "Remove" on a cart item
- **THEN** the item is removed from the cart

#### Scenario: Empty cart
- **WHEN** the customer has no items in the cart
- **THEN** the cart page displays "Your cart is empty" with a link to continue shopping

### Requirement: Cart persists across sessions
The system SHALL persist the cart on the server for authenticated customers.

#### Scenario: Reload page
- **WHEN** the customer reloads the page
- **THEN** the cart state is restored from the server
