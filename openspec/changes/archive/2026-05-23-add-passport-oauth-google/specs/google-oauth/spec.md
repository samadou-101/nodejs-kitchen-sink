## ADDED Requirements

### Requirement: Frontend OAuth method selector

The frontend OAuth demo page SHALL provide a dropdown selector that lets the user choose between "Custom" and "Passport" OAuth implementations before initiating the login flow.

#### Scenario: User selects Custom method

- **WHEN** the user selects "Custom" from the dropdown
- **THEN** the login button SHALL use the existing fetch-based flow: `fetch(/api/auth/oauth/google/url)` → JSON `{ url }` → `window.location.href = url`

#### Scenario: User selects Passport method

- **WHEN** the user selects "Passport" from the dropdown
- **THEN** the login button SHALL navigate directly to `/api/auth/oauth/passport/google/url` via `window.location.href`

#### Scenario: Method persists during session

- **WHEN** the user selects a method from the dropdown
- **THEN** the selection SHALL remain active until changed or until the page is reloaded

## MODIFIED Requirements

### Requirement: Login button initiates flow

The frontend SHALL provide a "Login with Google" button that initiates the OAuth flow using the currently selected method (Custom or Passport).

#### Scenario: Button click with Custom method

- **WHEN** the user clicks "Login with Google" with the Custom method selected
- **THEN** the browser SHALL fetch `/api/auth/oauth/google/url` and navigate to the returned URL

#### Scenario: Button click with Passport method

- **WHEN** the user clicks "Login with Google" with the Passport method selected
- **THEN** the browser SHALL navigate to `/api/auth/oauth/passport/google/url` directly
