## ADDED Requirements

### Requirement: EcomHeader renders as a standalone component

The system SHALL provide an `EcomHeader` component extracted from `AppLayout.tsx` into its own file. The `AppLayout` SHALL render `<EcomHeader />` in place of the current inline `<nav>` block.

### Requirement: Desktop layout has three sections

On desktop (`md:` breakpoint and above), the header SHALL display three visually distinct horizontal sections: left (logo), center (nav links), right (cart + auth actions). The center section SHALL be perfectly centered regardless of left/right content widths.

#### Scenario: Desktop three-section layout renders

- **WHEN** the viewport is at or above the `md:` breakpoint
- **THEN** the header SHALL display a grid with three columns showing the logo on the left, nav links in the center, and cart + auth actions on the right

#### Scenario: Mobile layout remains unchanged

- **WHEN** the viewport is below the `md:` breakpoint
- **THEN** the header SHALL display the logo on the left, and a cart icon + hamburger menu on the right, matching the current mobile layout

### Requirement: Nav links are Products, About Us, Track Order

The center section of the desktop header SHALL display exactly three nav links: "Products" (linking to `/`), "About Us" (linking to `/about`), and "Track Order" (linking to `/track`). The cart link SHALL NOT appear in the center section.

#### Scenario: Nav links render with active state

- **WHEN** the user is on a route matching a nav link
- **THEN** that nav link SHALL display the active state (underlined indicator, semibold weight)

#### Scenario: Products is active on root route

- **WHEN** the user is at `/`
- **THEN** the "Products" nav link SHALL display the active state

### Requirement: Right section shows cart icon always

The right section SHALL always display a cart icon button. The icon SHALL show a badge with the current cart item count when there are items in the cart.

#### Scenario: Cart icon shows total items badge

- **WHEN** the cart has items with `totalItems > 0`
- **THEN** the cart icon SHALL display a badge with the item count

#### Scenario: Cart icon shows no badge on empty cart

- **WHEN** the cart is empty (`totalItems === 0`)
- **THEN** the cart icon SHALL display without a badge

### Requirement: Right section shows auth-appropriate actions

The right section SHALL conditionally render actions based on authentication state.

#### Scenario: Unauthenticated user sees language switcher

- **WHEN** the user is not authenticated
- **THEN** the right section SHALL display a language switcher placeholder (e.g., "EN") alongside the cart icon

#### Scenario: Authenticated admin sees Dashboard link and Logout

- **WHEN** the user is authenticated and has the ADMIN role
- **THEN** the right section SHALL display the cart icon, a "Dashboard" link to `/admin`, and a "Logout" button

#### Scenario: Authenticated employee sees My Orders link and Logout

- **WHEN** the user is authenticated and has the EMPLOYEE role
- **THEN** the right section SHALL display the cart icon, a "My Orders" link to `/employee`, and a "Logout" button

#### Scenario: Authenticated user with both roles sees both links

- **WHEN** the user is authenticated and has both ADMIN and EMPLOYEE roles
- **THEN** the right section SHALL display the cart icon, "Dashboard" link, "My Orders" link, and a "Logout" button

#### Scenario: Unauthenticated user sees login links in mobile sheet

- **WHEN** the user is not authenticated and on mobile viewport
- **THEN** the mobile Sheet menu SHALL display "Admin Login" and "Employee Login" links

### Requirement: Bolder header design

The header SHALL have increased visual weight compared to the current layout. It SHALL use a taller height (`h-16`), stronger shadow (`shadow-md`), bolder logo typography, and a thicker bottom border.

#### Scenario: Header renders with increased height and shadow

- **WHEN** the EcomHeader component renders
- **THEN** it SHALL have the CSS classes `h-16`, `shadow-md`, `border-b-2` applied to the `<nav>` element
