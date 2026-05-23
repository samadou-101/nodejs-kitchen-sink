## Why

Practice implementing a custom Google OAuth 2.0 flow from scratch — no Passport.js, no third-party auth library. This is a sandbox learning exercise to understand the OAuth handshake, token exchange, and session/JWT creation at a low level.

## What Changes

- Add `OAuthAccount` model to Prisma schema (standalone, no FK to `User`)
- Create `oauth.utils.ts` with Google URL builder, token exchange, and profile fetch helpers
- Create `oauth.service.ts` with `initiateGoogleAuth()` and `handleGoogleCallback()` logic
- Create `oauth.controller.ts` that routes requests by path
- Add two GET routes to `auth.routes.ts`: `/auth/oauth/google/url` and `/auth/oauth/google/callback`
- Build `OAuth.tsx` React component in the overview sandbox with "Login with Google" button, JWT parsing from URL, and user info display
- Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` to `.env`

## Capabilities

### New Capabilities
- `google-oauth`: Custom Google OAuth 2.0 login flow — consent URL generation, code exchange, profile fetch, account upsert, and JWT-based session

### Modified Capabilities
<!-- None — this is a new sandbox feature with no existing spec changes -->

## Impact

- **Backend**: New files in `src/api/auth/oauth/custom/`, 2 new routes in `auth.routes.ts`, new Prisma model requiring migration
- **Frontend**: New React component in `overview/features/auth/oauth/custom/OAuth.tsx`, swapped into `Overview.tsx`
- **Config**: 3 new environment variables
- **No changes** to ecom module, password auth, or session auth
