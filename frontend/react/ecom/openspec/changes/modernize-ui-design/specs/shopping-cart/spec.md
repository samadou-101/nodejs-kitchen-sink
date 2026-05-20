## ADDED Requirements

### Requirement: Cart items display product thumbnails
The system SHALL display a small product image thumbnail for each item in the cart.

#### Scenario: Cart item shows thumbnail
- **WHEN** the customer views their cart
- **THEN** each cart item row displays a 48x48 ProductImage thumbnail next to the product name

### Requirement: Cart page is responsive
The system SHALL display the cart page with a responsive layout that adapts to mobile viewports.

#### Scenario: Responsive cart layout
- **WHEN** the viewport is below 768px
- **THEN** cart items stack vertically, quantity controls are full-width, and the summary and checkout button stack below the items
- **WHEN** the viewport is above 768px
- **THEN** cart items display in a row layout with inline quantity controls, and the summary appears beside the checkout button
