## ADDED Requirements

### Requirement: Products display images in catalog and detail views
The system SHALL display a product image alongside product information in the catalog grid, product detail page, and loading skeletons.

#### Scenario: Product card shows image
- **WHEN** the product catalog renders a product card
- **THEN** the card displays a ProductImage at the top with 4:3 aspect ratio, followed by the product name, description (clamped), and price

#### Scenario: Product detail shows hero image
- **WHEN** the customer views a product detail page
- **THEN** the page displays a large hero ProductImage (16:9 aspect ratio) at the top, followed by the product name, description, and price with an Add to Cart button

#### Scenario: Loading skeleton shows image placeholder
- **WHEN** product data is loading
- **THEN** the SkeletonCard renders an image-shaped skeleton placeholder at the top followed by text line skeletons

### Requirement: Product grid is responsive
The system SHALL display the product grid with responsive column counts.

#### Scenario: Responsive grid columns
- **WHEN** the viewport is below 640px
- **THEN** the product grid displays 1 column
- **WHEN** the viewport is 640px-768px
- **THEN** the product grid displays 2 columns
- **WHEN** the viewport is 768px-1024px
- **THEN** the product grid displays 3 columns
- **WHEN** the viewport is above 1024px
- **THEN** the product grid displays 4 columns

### Requirement: Product card shows Add to Cart on hover
The system SHALL display an Add to Cart CTA when the user hovers over a product card.

#### Scenario: Add to Cart appears on hover
- **WHEN** the user hovers over a product card
- **THEN** an Add to Cart button fades in at the bottom of the card image area
