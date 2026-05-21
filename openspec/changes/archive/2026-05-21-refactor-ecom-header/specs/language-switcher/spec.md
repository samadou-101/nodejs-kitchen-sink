## ADDED Requirements

### Requirement: Language switcher displays as placeholder UI

The system SHALL display a language switcher element in the header's right section when the user is not authenticated. The switcher SHALL be purely presentational with no locale-switching behavior.

#### Scenario: Language switcher appears for unauthenticated users

- **WHEN** the user is not authenticated and the viewport is at or above `md:` breakpoint
- **THEN** the right section of the header SHALL display a "EN" label with a dropdown chevron icon, indicating a language picker

#### Scenario: Language switcher hidden from authenticated users

- **WHEN** the user is authenticated
- **THEN** the language switcher SHALL NOT be displayed in the header right section

#### Scenario: Language switcher hidden on mobile

- **WHEN** the viewport is below `md:` breakpoint
- **THEN** the language switcher SHALL NOT be displayed
