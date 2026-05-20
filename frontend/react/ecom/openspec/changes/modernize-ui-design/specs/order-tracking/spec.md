## ADDED Requirements

### Requirement: Order tracking page is responsive
The system SHALL display the order tracking form and results with a responsive layout.

#### Scenario: Responsive tracking form
- **WHEN** the viewport is below 640px
- **THEN** the tracking form is full-width with the input and button stacked vertically
- **WHEN** the viewport is above 640px
- **THEN** the tracking form displays the input and button inline, centered in a max-w-md container

### Requirement: Order status uses Badge component
The system SHALL display order statuses using the shared Badge component instead of inline color classes.

#### Scenario: Status badge in tracking results
- **WHEN** order tracking results are displayed
- **THEN** each order status is rendered as a shadcn Badge with variant matching the status (pending=amber, confirmed=emerald, cancelled=red, shipped=blue, delivered=green)

#### Scenario: Status badge in order detail
- **WHEN** order detail page renders
- **THEN** the order status is rendered as a shadcn Badge

### Requirement: Order detail shows product thumbnails
The system SHALL display product thumbnails for each item in the order detail view.

#### Scenario: Order detail item thumbnails
- **WHEN** the customer views an order detail
- **THEN** each order item displays a small ProductImage thumbnail next to the product identifier
