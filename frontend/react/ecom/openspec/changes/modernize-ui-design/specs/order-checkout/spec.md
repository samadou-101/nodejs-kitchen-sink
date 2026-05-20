## ADDED Requirements

### Requirement: Checkout form uses shared Field components
The system SHALL render all checkout form fields using the shared Field wrapper with consistent Label, Input, and error display.

#### Scenario: Checkout form fields use Field component
- **WHEN** the checkout form renders
- **THEN** each input (name, phone, address, city, notes) uses `<Field label="..." error={...}>` wrapping shadcn Input/Textarea components

### Requirement: Checkout page is responsive
The system SHALL display the checkout page with a responsive layout.

#### Scenario: Responsive checkout
- **WHEN** the viewport is below 768px
- **THEN** the checkout form is full-width with single-column layout
- **WHEN** the viewport is above 768px
- **THEN** the checkout form is centered in a max-w-lg card

### Requirement: Order confirmation shows success animation
The system SHALL display a subtle success animation on the order confirmation page.

#### Scenario: Confirmation success animation
- **WHEN** the order is placed successfully
- **THEN** the confirmation page displays a checkmark icon with a brief scale-in animation
