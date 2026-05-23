## 1. Prisma Schema

- [x] 1.1 Add `OAuthAccount` model to `prisma/schema.prisma` with fields: id, provider, providerId, email, name, avatarUrl, createdAt, updatedAt
- [x] 1.2 Add unique constraint on `[provider, providerId]`
- [x] 1.3 Regenerate Prisma client with `npx prisma generate`
- [x] 1.4 Push schema changes to database with `npx prisma db push`

## 2. Backend Utils

- [x] 2.1 Implement `getGoogleAuthURL()` in `oauth.utils.ts` — constructs the Google consent URL with client_id, redirect_uri, scope, response_type
- [x] 2.2 Implement `getGoogleTokens(code)` in `oauth.utils.ts` — POST to `https://oauth2.googleapis.com/token` to exchange auth code for access token
- [x] 2.3 Implement `getGoogleProfile(accessToken)` in `oauth.utils.ts` — GET `https://www.googleapis.com/oauth2/v2/userinfo` to fetch user profile

## 3. Backend Service

- [x] 3.1 Implement `initiateGoogleAuth()` in `oauth.service.ts` — returns the Google consent URL from `getGoogleAuthURL()`
- [x] 3.2 Implement `handleGoogleCallback(code)` in `oauth.service.ts` — exchanges code, fetches profile, upserts `OAuthAccount`, signs a JWT with `{ name, email, avatar }`, returns the JWT

## 4. Backend Controller & Routes

- [x] 4.1 Implement `oauthHandler` in `oauth.controller.ts` — routes by `req.path` to either return the URL or handle the callback
- [x] 4.2 Add `GET /auth/oauth/google/url` and `GET /auth/oauth/google/callback` routes to `auth.routes.ts`

## 5. Environment Variables

- [x] 5.1 Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` to `.env`

## 6. Frontend Component

- [x] 6.1 Build `OAuth.tsx` — "Login with Google" button that redirects to `/api/auth/oauth/google/url`
- [x] 6.2 Add logic to parse `?token=xxx` from URL on mount and base64-decode the JWT payload
- [x] 6.3 Render user info card (avatar, name, email) when token is present
- [x] 6.4 Add error state display when `?error=xxx` is present
- [x] 6.5 Add "Logout" button that clears state and returns to login view

## 7. Integration

- [x] 7.1 Swap `<OAuth />` into `Overview.tsx` for testing
