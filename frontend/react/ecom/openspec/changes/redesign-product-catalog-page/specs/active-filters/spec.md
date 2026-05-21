## ADDED Requirements

### Requirement: Active filters display
The system SHALL display active search and category filters as removable chips between the controls bar and the product grid.

#### Scenario: Active search term shows as chip
- **WHEN** the user enters a search term
- **THEN** a chip SHALL appear showing the search term text with an `×` dismiss icon using `variant="secondary"` badge styling

#### Scenario: Active category shows as chip
- **WHEN** the user selects a category filter
- **THEN** a chip SHALL appear showing the category name with an `×` dismiss icon using `variant="secondary"` badge styling

#### Scenario: Dismiss chip clears specific filter
- **WHEN** the user clicks the `×` icon on a search chip
- **THEN** the search SHALL be cleared AND the product grid SHALL update accordingly

#### Scenario: Dismiss category chip clears category filter
- **WHEN** the user clicks the `×` icon on a category chip
- **THEN** the category filter SHALL be cleared AND the product grid SHALL update accordingly

#### Scenario: "Clear all" with multiple active filters
- **WHEN** two or more filters are active
- **THEN** a "Clear all" link SHALL appear after the chips that resets all filters when clicked

#### Scenario: No chips when no filters active
- **WHEN** no search term or category filter is active
- **THEN** no active filter chips SHALL be displayed

#### Scenario: Chip animation on change
- **WHEN** a filter is added or removed
- **THEN** the active filters container SHALL transition smoothly with `transition-all duration-200`
