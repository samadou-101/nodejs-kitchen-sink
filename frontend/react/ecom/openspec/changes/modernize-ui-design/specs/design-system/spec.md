## ADDED Requirements

### Requirement: Theme uses a neutral zinc-based palette
The system SHALL use a neutral zinc-based color palette defined via Tailwind CSS v4 theme variables in `global.css`.

#### Scenario: Theme variables are defined
- **WHEN** the application loads
- **THEN** CSS custom properties are set for background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, and sidebar colors using a zinc-based oklch palette

#### Scenario: Status colors are semantically mapped
- **WHEN** an order status is displayed
- **THEN** the color maps: 1=Pending (amber), 2=Confirmed (emerald), 3=Shipped (blue), 4=Delivered (green), 5=Cancelled (red)

### Requirement: shadcn component library is fully built out
The system SHALL provide Input, Select, Textarea, Label, Badge, Table, Dialog, Sheet, Toast, and Skeleton components from the shadcn/ui library. These replace all raw HTML equivalents.

#### Scenario: Input component replaces raw inputs
- **WHEN** a form needs a text input
- **THEN** the system renders a shadcn Input component with consistent styling, focus ring, and disabled state

#### Scenario: Select component replaces raw selects
- **WHEN** a form needs a dropdown selection
- **THEN** the system renders a shadcn Select component with consistent styling

#### Scenario: Badge component renders status indicators
- **WHEN** an order status is displayed anywhere
- **THEN** the system renders a shadcn Badge with a variant matching the status (pending=amber, confirmed=emerald, cancelled=red, shipped=blue, delivered=green)

#### Scenario: Dialog component renders modals
- **WHEN** a modal/confirmation overlay is needed
- **THEN** the system renders a shadcn Dialog with backdrop blur, escape-to-close, and focus trap behavior

#### Scenario: Sheet component renders mobile navigation
- **WHEN** the viewport is below the `md` breakpoint and the user clicks the hamburger menu
- **THEN** the system renders a shadcn Sheet sliding in from the right with navigation links

#### Scenario: Table component renders data lists
- **WHEN** admin CRUD pages display lists of products, orders, employees, or payroll runs
- **THEN** the system renders a shadcn Table with consistent column layout and row styling

#### Scenario: Toast component renders notifications
- **WHEN** a user action succeeds or fails (add to cart, confirm order, create product)
- **THEN** the system renders a Sonner toast notification with appropriate variant (success/error)

#### Scenario: Skeleton component renders loading placeholders
- **WHEN** data is being fetched
- **THEN** the system renders a Skeleton component with a shimmer animation instead of raw animate-pulse divs

### Requirement: Form fields use a shared Field wrapper
The system SHALL provide a shared Field component that wraps a Label, input component, and error message together.

#### Scenario: Field component renders consistently
- **WHEN** a form is rendered
- **THEN** each form field uses `<Field label="..." error={...}>` wrapping the input element, producing consistent spacing, label styling, and error display

### Requirement: Product images display with fallback
The system SHALL provide a ProductImage component that displays product images with lazy loading, aspect-ratio containers, and graceful fallback.

#### Scenario: Product image renders
- **WHEN** a product has an imageUrl
- **THEN** the ProductImage component renders an `<img>` with `loading="lazy"`, `object-cover`, and an aspect-ratio container

#### Scenario: Product image fallback on error
- **WHEN** a product image fails to load
- **THEN** the ProductImage component displays a gradient fallback with a product outline icon

#### Scenario: Product image fallback when missing
- **WHEN** a product has no imageUrl
- **THEN** the ProductImage component displays the gradient fallback with a product outline icon

### Requirement: Animations are minimal and CSS-only
The system SHALL use minimal CSS-only animations via tw-animate-css utility classes. No JavaScript animation libraries.

#### Scenario: Card hover animation
- **WHEN** the user hovers over a product card
- **THEN** the card scales to 1.02 and shadow increases

#### Scenario: Button press animation
- **WHEN** the user clicks a button
- **THEN** the button briefly reduces brightness to 95%

#### Scenario: Skeleton shimmer animation
- **WHEN** a skeleton placeholder is visible
- **THEN** it uses a shimmer gradient animation (not Tailwind pulse)

#### Scenario: Dialog open animation
- **WHEN** a dialog opens
- **THEN** the backdrop fades in and the content scales in smoothly

#### Scenario: Page content fade-in
- **WHEN** a page loads
- **THEN** the main content fades in and slides up slightly
