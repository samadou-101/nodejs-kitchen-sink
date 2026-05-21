## ADDED Requirements

### Requirement: Quick-filter category pills
The system SHALL display category pills above the product grid for one-tap category filtering, alongside the existing category dropdown.

#### Scenario: Category pills render from fetched categories
- **WHEN** the product catalog page loads and categories are available
- **THEN** the first 6-8 categories SHALL render as clickable badge-style pills in a horizontal row

#### Scenario: Inactive pill has outline style
- **WHEN** a category pill is not selected
- **THEN** it SHALL use `variant="outline"` badge styling

#### Scenario: Active pill has filled style
- **WHEN** a category pill is selected (matching the current category filter)
- **THEN** it SHALL use `variant="default"` badge styling

#### Scenario: Clicking pill sets category filter
- **WHEN** the user clicks an inactive category pill
- **THEN** the category filter SHALL be set to that category AND the product grid SHALL update

#### Scenario: Clicking active pill clears filter
- **WHEN** the user clicks the currently active category pill
- **THEN** the category filter SHALL be cleared AND the product grid SHALL show all categories

#### Scenario: Pills scroll horizontally on overflow
- **WHEN** category pills exceed the available horizontal space
- **THEN** the container SHALL scroll horizontally with `overflow-x-auto`

#### Scenario: Pills stay in sync with dropdown
- **WHEN** a category is selected via the dropdown
- **THEN** the corresponding pill SHALL activate to `variant="default"`

#### Scenario: No pills when no categories
- **WHEN** no categories are returned from the API
- **THEN** no category pills SHALL be displayed
