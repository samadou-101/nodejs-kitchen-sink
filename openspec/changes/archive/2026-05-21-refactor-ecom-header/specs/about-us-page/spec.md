## ADDED Requirements

### Requirement: About Us page renders at /about

The system SHALL provide a static About Us page accessible at the `/about` route.

#### Scenario: Navigate to About Us page

- **WHEN** the user clicks the "About Us" link in the nav or navigates to `/about`
- **THEN** the system renders a static About Us page with information about the store

#### Scenario: About Us nav link highlights on active route

- **WHEN** the user is on the `/about` page
- **THEN** the "About Us" nav link SHALL display the active state styling
