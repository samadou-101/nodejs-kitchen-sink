# Auth

## Email/Password Auth

- User submits form (name, email, password)
- Server validates input
- Password is hashed
- User is created in DB
- Access token + refresh token are generated
- Refresh token is stored securely (DB or cookie)
- Tokens are sent to client (preferably via httpOnly cookies)
- User info returned
