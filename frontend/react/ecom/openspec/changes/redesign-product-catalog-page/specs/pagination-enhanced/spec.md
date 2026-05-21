## ADDED Requirements

### Requirement: Page-number pagination
The system SHALL display pagination with page number buttons and ellipsis, replacing the previous prev/next-only pagination.

#### Scenario: Pagination shows page numbers
- **WHEN** the product catalog has multiple pages
- **THEN** the pagination SHALL display page number buttons using `variant="outline"` for inactive pages and `variant="default"` for the active page

#### Scenario: Previous and Next buttons
- **WHEN** pagination is displayed
- **THEN** Previous and Next button labels SHALL be rendered as left/right arrow icons (ChevronLeftIcon / ChevronRightIcon from @hugeicons/react) using `variant="outline"` with `size="icon"`

#### Scenario: Previous disabled on first page
- **WHEN** the current page is page 1
- **THEN** the Previous button SHALL be disabled

#### Scenario: Next disabled on last page
- **WHEN** the current page is the last page
- **THEN** the Next button SHALL be disabled

#### Scenario: Ellipsis for large page counts
- **WHEN** total pages exceed 7
- **THEN** ellipsis (`...` as a span) SHALL be shown to collapse page numbers while keeping first, last, and current ±1 pages visible

#### Scenario: Page navigation updates results
- **WHEN** the user clicks a page number button
- **THEN** the product grid SHALL update to show products for that page

#### Scenario: Pagination hidden for single page
- **WHEN** total pages is 1 or fewer
- **THEN** pagination SHALL NOT be rendered

#### Scenario: Pagination shows total count
- **WHEN** pagination is displayed
- **THEN** the component SHALL display the total product count as text (e.g., "24 products")
