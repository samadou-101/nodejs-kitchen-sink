## ADDED Requirements

### Requirement: Cart is stored client-side
The system SHALL maintain cart state in memory (React state) and persist to localStorage. Backend cart endpoints are placeholders and are not used for actual cart logic.

#### Scenario: Add item to cart
- **WHEN** the customer clicks "Add to Cart" on a product
- **THEN** the item is added to the local cart state with quantity 1 and a confirmation toast is shown

#### Scenario: Cart persists after page reload
- **WHEN** the customer reloads the page
- **THEN** the cart state is restored from localStorage

#### Scenario: Empty cart on first visit
- **WHEN** a new customer visits the site
- **THEN** the cart is empty

### Requirement: Customer can manage cart quantities
The system SHALL allow customers to increase, decrease, and remove items from the cart.

#### Scenario: Increment quantity
- **WHEN** the customer clicks "+" on a cart item
- **THEN** the quantity increases by 1 and the subtotal updates

#### Scenario: Decrement quantity
- **WHEN** the customer clicks "-" on a cart item and quantity is greater than 1
- **THEN** the quantity decreases by 1 and the subtotal updates

#### Scenario: Remove item when quantity reaches 0
- **WHEN** the customer clicks "-" on a cart item with quantity 1
- **THEN** the item is removed from the cart

#### Scenario: Remove item directly
- **WHEN** the customer clicks the "Remove" button on a cart item
- **THEN** the item is removed from the cart

### Requirement: Cart displays totals
The system SHALL compute and display item count and total price from the local cart state.

#### Scenario: View cart summary
- **WHEN** the customer opens the cart
- **THEN** the cart shows the subtotal for each item, total item count, and grand total

#### Scenario: Empty cart view
- **WHEN** the cart has no items
- **THEN** the cart page displays "Your cart is empty" with a link to continue shopping

### Requirement: Cart is cleared after successful checkout
The system SHALL clear the local cart state upon successful order placement.

#### Scenario: Clear cart on checkout
- **WHEN** the order is placed successfully
- **THEN** the cart is cleared from both React state and localStorage
