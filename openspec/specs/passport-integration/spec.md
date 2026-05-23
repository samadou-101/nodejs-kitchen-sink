## Purpose

Provide a Passport.js-based Google OAuth 2.0 flow that parallels the existing custom implementation, allowing developers to compare both approaches. No Express sessions are used — Passport handles only the OAuth strategy flow (redirect → code → token → profile).

## Requirements

### Requirement: Passport.js Google strategy configuration

The system SHALL configure a Passport.js Google OAuth 2.0 strategy using the `passport-google-oauth20` package with the same credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`) from the environment.

#### Scenario: Strategy registered

- **WHEN** the Passport strategy is initialized
- **THEN** it SHALL use the `GoogleStrategy` with the correct client ID, client secret, and callback URL

### Requirement: Passport Google auth URL endpoint

The system SHALL provide an endpoint at `GET /api/auth/oauth/passport/google/url` that initiates the Google OAuth flow by redirecting the browser to Google's consent screen (Passport issues a 302, not JSON).

#### Scenario: Frontend initiates passport login

- **WHEN** a GET request is made to `/api/auth/oauth/passport/google/url`
- **THEN** the browser SHALL be redirected to Google's consent screen with the correct `client_id`, `redirect_uri`, and `scope`

### Requirement: Passport Google callback endpoint

The system SHALL provide an endpoint at `GET /api/auth/oauth/passport/google/callback` that handles the Google OAuth callback via Passport's `authenticate()` middleware.

#### Scenario: Successful passport callback

- **WHEN** Google redirects to the callback endpoint with a valid authorization code
- **THEN** Passport SHALL exchange the code for an access token and return the Google profile to the verify callback

#### Scenario: Failed passport callback

- **WHEN** Google redirects to the callback endpoint with an error
- **THEN** the system SHALL redirect the browser to `http://localhost:5173/oauth/success?error=<message>`

### Requirement: Passport verify callback

The Passport verify callback SHALL receive the Google profile, upsert an `OAuthAccount` record, sign a JWT, and redirect the browser to the frontend with the token.

#### Scenario: Verify callback succeeds

- **WHEN** the verify callback receives a valid Google profile
- **THEN** the system SHALL:
  - Upsert the `OAuthAccount` record with `provider: "google"` and the profile data
  - Sign a JWT with `{ name, email, avatar }` using `ACCESS_TOKEN_SECRET` with 1h expiry
  - Redirect to `http://localhost:5173/oauth/success?token=<jwt>`

### Requirement: Stateless Passport (no sessions)

The Passport integration SHALL NOT use Express sessions. `session: false` SHALL be passed to `passport.authenticate()`. No `serializeUser` or `deserializeUser` functions SHALL be defined.

#### Scenario: No session created

- **WHEN** the Passport callback completes
- **THEN** no Express session SHALL be created and no session cookie SHALL be set
