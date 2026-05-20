## ADDED Requirements

### Requirement: Order status uses Badge component
The system SHALL display assigned order statuses using the shared Badge component.

#### Scenario: Status badge in assigned orders list
- **WHEN** the employee views their assigned orders
- **THEN** each order's status is rendered as a shadcn Badge with variant matching the status

### Requirement: Confirmation dialog uses Dialog component
The system SHALL use the shadcn Dialog component for the order confirmation modal.

#### Scenario: Confirm dialog opens with animation
- **WHEN** the employee clicks "Confirm" on an order
- **THEN** a shadcn Dialog opens with backdrop blur, fade-in animation, and escape-to-close behavior

#### Scenario: Dialog shows product thumbnails
- **WHEN** the confirm dialog shows order details
- **THEN** each order item displays a small ProductImage thumbnail next to the product info
