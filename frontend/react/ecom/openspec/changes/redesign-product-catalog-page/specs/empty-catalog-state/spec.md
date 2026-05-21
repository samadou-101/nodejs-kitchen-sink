## ADDED Requirements

### Requirement: Empty catalog state
The system SHALL display a polished empty state when no products match the current filters and loading is complete.

#### Scenario: Empty state with search filter active
- **WHEN** the product grid has no results AND a search term is active AND loading is complete
- **THEN** the system SHALL display a centered icon (size-16, `text-muted-foreground/40`), a "No products found" heading, and a subtitle "No results for "{search}" — try a different search term or clear your filters." with a "Clear filters" button

#### Scenario: Empty state with category filter active
- **WHEN** the product grid has no results AND a category filter is active AND no search term is active AND loading is complete
- **THEN** the system SHALL display a centered icon, "No products found" heading, and a subtitle "No products in this category yet. Try a different category or clear your filters." with a "Clear filters" button

#### Scenario: Empty state with no filters
- **WHEN** the product grid has no results AND no filters are active AND loading is complete
- **THEN** the system SHALL display a centered icon, "No products found" heading, and a generic subtitle with no "Clear filters" button

#### Scenario: Clear filters button resets all filters
- **WHEN** the user clicks "Clear filters" in the empty state
- **THEN** all filters SHALL be reset AND the product grid SHALL reload with default parameters

#### Scenario: Empty state hidden during loading
- **WHEN** data is still loading
- **THEN** the empty state SHALL NOT be shown (loading skeleton SHALL be displayed instead)
