## ADDED Requirements

### Requirement: Catalog hero banner
The system SHALL display a visually enhanced hero section at the top of the product catalog page, replacing the plain "Products" heading.

#### Scenario: Hero renders with gradient background
- **WHEN** the product catalog page loads
- **THEN** the hero section SHALL render with a `bg-gradient-to-b from-primary/[0.03] to-background` gradient background

#### Scenario: Hero shows heading and tagline
- **WHEN** the product catalog page loads
- **THEN** the hero SHALL display a "Discover Products" heading (`text-3xl font-semibold tracking-tight`) and a muted tagline "Find what you need" (`text-sm text-muted-foreground`)

#### Scenario: Hero integrates search and category controls
- **WHEN** the hero section is rendered
- **THEN** the search bar and category dropdown SHALL be rendered inline within the hero area, not as separate elements below it

#### Scenario: Hero preserves existing search and category functionality
- **WHEN** the user types in the search bar within the hero
- **THEN** the search SHALL debounce and trigger product search exactly as the existing SearchBar component does
