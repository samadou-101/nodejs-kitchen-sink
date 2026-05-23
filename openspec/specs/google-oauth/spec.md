## Purpose

Implement a custom Google OAuth 2.0 authorization code flow (no Passport.js) as a sandbox learning exercise. Users authenticate via Google and see their profile on the frontend via a JWT carried in the URL.

## Requirements

### Requirement: Google consent URL generation

The system SHALL provide an endpoint that returns a Google OAuth consent URL with the correct client_id, redirect_uri, response_type, and scope.

#### Scenario: Frontend requests login URL

- **WHEN** a GET request is made to `/api/auth/oauth/google/url`
- **THEN** the response SHALL contain `{ "url": "https://accounts.google.com/o/oauth2/v2/auth?..." }`

### Requirement: OAuth code exchange

The system SHALL exchange the authorization code received from Google for an access token by calling `POST https://oauth2.googleapis.com/token`.

#### Scenario: Successful code exchange

- **WHEN** the callback endpoint receives a valid authorization code
- **THEN** the system SHALL exchange it for an access token and fetch the user's Google profile

### Requirement: Google profile fetch

The system SHALL fetch the authenticated user's Google profile using `GET https://www.googleapis.com/oauth2/v2/userinfo` with the obtained access token.

#### Scenario: Profile retrieved

- **WHEN** the access token is used to call the userinfo endpoint
- **THEN** the system SHALL receive at minimum: `id`, `email`, `name`, `picture`

### Requirement: OAuthAccount record creation

The system SHALL upsert an `OAuthAccount` record keyed by `[provider, providerId]` after a successful Google login.

#### Scenario: New Google user

- **WHEN** a user logs in with Google for the first time
- **THEN** a new `OAuthAccount` record SHALL be created with the provider, providerId, email, name, and avatar URL

#### Scenario: Returning Google user

- **WHEN** a returning user logs in with the same Google account
- **THEN** the existing `OAuthAccount` record SHALL be updated with the latest profile info

### Requirement: JWT generation for frontend

The system SHALL generate a JWT containing the user's Google profile info (name, email, avatar) and redirect the browser to the frontend with the token in the URL.

#### Scenario: Successful login redirect

- **WHEN** the callback completes successfully
- **THEN** the browser SHALL be redirected to `http://localhost:5173/oauth/success?token=<jwt>`

#### Scenario: Login error

- **WHEN** the callback encounters an error (invalid code, network failure)
- **THEN** the browser SHALL be redirected to `http://localhost:5173/oauth/success?error=<message>`

### Requirement: Frontend user info display

The frontend SHALL display the authenticated user's name, email, and avatar from the decoded JWT on the success page.

#### Scenario: User sees profile after login

- **WHEN** the success page loads with a valid `token` query param
- **THEN** the page SHALL decode the JWT payload and render the user's avatar, name, and email

#### Scenario: Error state shown

- **WHEN** the success page loads with an `error` query param
- **THEN** the page SHALL display the error message

### Requirement: Login button initiates flow

The frontend SHALL provide a "Login with Google" button that redirects the browser to the Google consent URL.

#### Scenario: Button click

- **WHEN** the user clicks "Login with Google"
- **THEN** the browser SHALL navigate to `/api/auth/oauth/google/url`

### Requirement: Logout clears state

The frontend SHALL provide a logout button that clears the user's session state and returns to the login screen.

#### Scenario: User logs out

- **WHEN** the user clicks "Logout"
- **THEN** the profile info SHALL be cleared and the login button SHALL be shown again
