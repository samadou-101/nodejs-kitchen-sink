# Security Plan — Hardening the Ecom Module for Production

> Written for someone new to web application security. Covers the common
> OWASP Top 10 concerns relevant to this codebase, the current state of each,
> and a concrete plan to fix critical and high-severity issues before launch.

---

## 1. Why Security Matters (Even for a COD Backend)

A cash-on-delivery backend handles sensitive data: employee accounts, order records, session tokens, and financial information. The threat model is not "nation-state attacker" — it's much simpler:

| Threat | Real-world impact |
|--------|------------------|
| **Brute-forced admin login** | Attacker gains full access to orders, employee data, payroll |
| **Stolen session cookie** | Attacker impersonates an admin without needing credentials |
| **Stored XSS in order notes** | Attacker injects script that steals other users' sessions |
| **CSRF on state-changing endpoints** | Attacker tricks an admin into creating/deleting orders via a link |
| **No rate limiting** | Automated credential stuffing against all auth endpoints |

The goal is not perfect security — it's raising the bar so that an opportunistic attacker moves on to an easier target.

### The current risk level

The audit found **19 findings**, including:

| Severity | Count | Examples |
|----------|-------|---------|
| **Critical** | 1 | Logout is a no-op — sessions never revoked |
| **High** | 4 | No rate limiting, no input validation on admin signup, no cookie security flags, password reset token in response |
| **Medium** | 10 | No CSRF, no CORS, no password policy, no account lockout, no body size limits, no XSS sanitization, no helmet, stateless refresh tokens |
| **Low** | 4 | Email enumeration, unsigned cookies, no session rotation on re-login, duplicate session check code |

---

## 2. Authentication & Session Management

### A. Logout is a No-Op (CRITICAL)

**Current state:** `logoutAdmin()` and `logoutEmployee()` are empty functions. Sessions are never revoked. A logged-out session remains valid for 7 days.

**File:** `src/modules/ecom/admin/services/auth.service.ts:56`, `src/modules/ecom/employee/services/auth.service.ts:79`

**What should happen on logout:**

```
Request → authenticate() → resolve user → revokeSession(sid) → clear cookie → response
```

The `revokeSession()` function already exists in `session.service.ts` — it deletes the session from both Redis and the database. It just never gets called.

**Fix:**

```typescript
// admin/services/auth.service.ts
import { revokeSession } from "@/api/auth/password/session.service"

export async function logoutAdmin(sessionId: string): Promise<void> {
  await revokeSession(sessionId)
}
```

The controllers also need to be wired to actually invoke the logout handler — currently the router has no logout route mapped for either admin or employee:

```typescript
// admin/controllers/auth.controller.ts — add handler
async function handleAdminLogout(req: Request, res: Response, next: NextFunction) {
  try {
    assertAuth(req.auth)
    await logoutAdmin(req.auth.sessionId)
    res.clearCookie("sid")
    sendSuccess(res, { message: "Logged out successfully" })
  }
  catch (err) {
    next(err)
  }
}
```

### B. Cookie Security Flags Are Missing (HIGH)

Every `res.cookie()` call in the codebase sets only `maxAge`:

```
res.cookie("sid", token, { maxAge: 7 * 24 * 60 * 60 * 1000 })
```

**What's missing:**

| Flag | What it does | Why it matters |
|------|-------------|----------------|
| `httpOnly: true` | Prevents JavaScript from reading the cookie | XSS can't steal the session |
| `secure: true` | Only sends cookie over HTTPS | MitM can't read it on HTTP |
| `sameSite: "lax"` or `"strict"` | Prevents browser from sending cookie on cross-origin requests | CSRF mitigation |
| `signed: true` | Signs the cookie so tampering is detectable | Attacker can't modify its value |

**Fix:**

```typescript
const isProduction = process.env.NODE_ENV === "production"

res.cookie("sid", sessionId, {
  httpOnly: true,
  secure: isProduction,     // true in production, false in dev (localhost)
  sameSite: "lax",          // lax allows top-level navigation GETs
  signed: true,             // requires cookieParser(secret)
  maxAge: 7 * 24 * 60 * 60 * 1000,
})
```

This also requires configuring `cookie-parser` with a secret:

```typescript
// src/app.ts
app.use(cookieParser(process.env.COOKIE_SECRET))
```

And reading the cookie via `req.signedCookies.sid` instead of `req.cookies.sid` in the auth middleware.

### C. Old Sessions Not Revoked on Re-Login (LOW)

When a user logs in while already having an active session, a new session is created but the old one is never revoked. Users accumulate multiple valid sessions.

**Fix:** Before creating a new session, revoke all existing sessions for that user:

```typescript
// session.service.ts — createSession
await prisma.session.updateMany({
  where: { userId, revoked: false },
  data: { revoked: true },
})
// Then create new session
```

### D. JWT Refresh Tokens Are Stateless (MEDIUM)

The ecom module uses session-based auth (not JWT), but the parallel JWT auth system under `/api/auth/password/` generates refresh tokens that are purely JWT-stateless — no server-side tracking, no revocation.

**This is acceptable for the current architecture** since the ecom module uses sessions. If JWT auth is used in the future, refresh tokens should be stored in Redis with a TTL matching the token expiry, allowing server-side revocation.

---

## 3. Brute Force Protection

### A. No Rate Limiting on Auth Routes (HIGH)

**Current state:** Auth endpoints have no protection against repeated requests.

**What rate limiting does:** Limits the number of requests from a single IP within a time window. For auth routes, a common policy is 5-10 attempts per minute per IP.

**Implementation with `express-rate-limit`:**

```bash
pnpm add express-rate-limit
pnpm add -D @types/express-rate-limit
```

```typescript
// src/modules/ecom/shared/rate-limiter.ts
import rateLimit from "express-rate-limit"

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 60_000,         // 1 minute
  max: 10,                   // 10 requests per minute
  standardHeaders: true,     // Return rate limit info in headers
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many requests — try again later" },
  },
})

// General API limiter (prevent DoS on all endpoints)
export const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many requests" },
  },
})
```

Register in `app.ts`:

```typescript
import { authLimiter, apiLimiter } from "./modules/ecom/shared/rate-limiter"

// Apply to all API routes
app.use("/api", apiLimiter)

// Stricter limits on auth routes
app.use("/api/ecom/admin/login", authLimiter)
app.use("/api/ecom/admin/signup", authLimiter)
app.use("/api/ecom/employee/login", authLimiter)
```

### B. No Account Lockout (MEDIUM)

**What account lockout does:** After N consecutive failed login attempts, the account is temporarily locked. This prevents attackers from guessing passwords over days or weeks.

**Implementation approach:**

1. Track failed attempts in Redis with a key like `lockout:{email}`:
   - On failed login: increment counter, set TTL to 15 minutes
   - On successful login: clear counter
   - If counter >= 5: return "Account temporarily locked" for the TTL duration

2. Alternatively, track in the database with a `lockoutUntil` field on the admin/employee table.

```typescript
// src/modules/ecom/shared/lockout.ts
import { redisClient } from "@/config/redis.config"

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 // 15 minutes in seconds

export async function checkLockout(identifier: string): Promise<void> {
  const attempts = await redisClient.get(`lockout:${identifier}`)
  if (attempts && parseInt(attempts) >= MAX_ATTEMPTS) {
    throw new TooManyRequestsError("Account temporarily locked — try again later")
  }
}

export async function recordFailedAttempt(identifier: string): Promise<void> {
  const key = `lockout:${identifier}`
  const attempts = await redisClient.incr(key)
  if (attempts === 1) {
    await redisClient.expire(key, LOCKOUT_DURATION)
  }
}

export async function clearLockout(identifier: string): Promise<void> {
  await redisClient.del(`lockout:${identifier}`)
}
```

Use in auth service:

```typescript
// On login attempt:
await checkLockout(email)

// On failed password:
await recordFailedAttempt(email)

// On successful login:
await clearLockout(email)
```

---

## 4. Input & Output Security

### A. Admin Signup Has Zero Validation (HIGH)

**Current state:** `adminAuthController` casts `req.body as AdminData` with no Zod validation.

**Fix:** Wire the existing `adminSchema` into the controller:

```typescript
// admin/controllers/auth.controller.ts
import { validateAdminSignup } from "../../validation/validators/admin.validator"

async function handleAdminSignup(req: Request, res: Response, next: NextFunction) {
  try {
    const adminData = validateAdminSignup(req.body)
    const result = await registerAdmin(adminData)
    sendCreated(res, result, "Admin registered successfully")
  }
  catch (err) {
    next(err)
  }
}
```

This is already done for employee signup — admin was simply missed.

### B. No Password Policy (MEDIUM)

**Current state:** The employee schema only checks `z.string().min(1)` — a single character password is valid.

**What a password policy should enforce:**

| Requirement | Why |
|-------------|-----|
| Minimum 8 characters | Length is the strongest predictor of password strength |
| OWASP recommends checking against common passwords | `"password123"` is guessed in seconds |
| No maximum length limit (or high limit like 128) | Prevents DoS via extremely long passwords |

**Implementation:**

```typescript
// Update validation schemas
password: z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")

// Optional: common password check
import { isCommonPassword } from "./common-passwords"

password: z.string().refine(
  (val) => !isCommonPassword(val),
  "This password is too common — choose a different one",
)
```

The common password check can be a simple list of the 1000 most common passwords (easily found online) or an external API.

### C. No Request Body Size Limit (MEDIUM)

**Current state:** `express.json()` has no `limit` option — relies on Express 5 defaults.

**Fix:**

```typescript
// src/app.ts
app.use(express.json({ limit: "1mb" }))
```

This rejects requests with bodies larger than 1MB with a 413 Payload Too Large response.

### D. No Input Sanitization (MEDIUM)

**Current state:** Text fields (notes, descriptions, addresses) are stored and returned as-is.

**What to sanitize:**

- **Trim whitespace** — `"  hello  "` → `"hello"`
- **Strip HTML tags** from text-only fields — prevents stored XSS if rendered in a frontend
- **Normalize Unicode** — prevents homoglyph attacks

**Implementation:**

```typescript
// src/modules/ecom/shared/sanitize.ts
export function sanitizeString(input: string): string {
  return input.trim().replace(/<[^>]*>/g, "")
}

// Apply in Zod schemas via transform
import { z } from "zod"
import { sanitizeString } from "../shared/sanitize"

export const orderSchema = z.object({
  notes: z.string().max(500).optional().transform((val) =>
    val ? sanitizeString(val) : val,
  ),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().positive(),
  })).min(1),
})
```

### E. No Security Headers (MEDIUM)

**Current state:** No `helmet` — no security headers at all.

**`helmet` sets these headers:**

| Header | What it prevents |
|--------|-----------------|
| `X-Content-Type-Options: nosniff` | MIME-type sniffing |
| `X-Frame-Options: DENY` | Clickjacking |
| `X-XSS-Protection: 0` | (modern: disabled old XSS filter) |
| `Strict-Transport-Security` | Forces HTTPS (if behind TLS) |
| `Content-Security-Policy` | XSS — controls which resources can load |

**Implementation:**

```bash
pnpm add helmet
```

```typescript
// src/app.ts
import helmet from "helmet"

app.use(helmet()) // Place at the top of middleware chain
```

### F. No CORS Configuration (MEDIUM)

**Current state:** No CORS headers are set.

**Implementation:**

```bash
pnpm add cors
pnpm add -D @types/cors
```

```typescript
// src/app.ts
import cors from "cors"

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  credentials: true,          // Allow cookies to be sent cross-origin
  methods: ["GET", "POST", "PATCH", "DELETE"],
}))
```

---

## 5. CSRF Protection

### No CSRF Protection (MEDIUM)

**How CSRF works:** An authenticated user visits a malicious site (or clicks a link in an email) that triggers a cross-origin request to the API. If the user has a valid session cookie, the browser sends it and the request is authenticated — the attacker performed an action as the user without the user's knowledge.

**Why it matters here:** The app uses cookie-based sessions. Any state-changing endpoint (create order, cancel order, confirm payroll) is vulnerable.

**Mitigation options:**

| Approach | How it works | Complexity |
|----------|-------------|------------|
| **SameSite cookie** | Browser won't send cookie on cross-origin POST | Simple — already covered in cookie flags fix |
| **CSRF token** | Server generates a token, client sends it in a header | Requires frontend cooperation |
| **Origin/Referer check** | Server checks `Origin` header against allowed origins | Simple server-side only |

**Recommended approach:** `sameSite: "lax"` on the session cookie covers most CSRF scenarios (POST requests from other origins won't include the cookie). For additional protection, add an origin check middleware:

```typescript
// src/modules/ecom/shared/csrf.ts
export function csrfProtection(req: Request, _res: Response, next: NextFunction) {
  const origin = req.headers.origin
  const referer = req.headers.referer
  const allowed = process.env.CORS_ORIGIN ?? "http://localhost:5173"

  // Skip for same-origin requests (no Origin header = browser same-origin)
  if (!origin && !referer) return next()

  const source = origin ?? referer
  if (!source?.startsWith(allowed)) {
    throw new ForbiddenError("Cross-origin request blocked")
  }

  next()
}
```

---

## 6. Information Leakage

### Email Enumeration (LOW)

**Current state:** Auth services return different error messages for "user not found" vs "wrong password":

```typescript
// admin/services/auth.service.ts
const admin = await findAdminByEmail(email)
if (!admin) throw new NotFoundError("No Admin found")  // Reveals: email not registered

const valid = await verifyPassword(password, admin.password)
if (!valid) throw new UnauthorizedError("Invalid Credentials")  // Reveals: email exists
```

**Fix:** Use the same error message for both cases:

```typescript
const admin = await findAdminByEmail(email)
if (!admin || !(await verifyPassword(password, admin.password))) {
  throw new UnauthorizedError("Invalid email or password")
}
```

The same generic message tells the attacker nothing about whether the email exists.

### Error Message Cleanup

The JWT auth files contain self-aware bad practices:

```
// session.service.ts:62
res.send("User Already Exists (note: bad for security)")

// jwt.service.ts:55
res.send("User Already Exists (evne if it is bad for security)")
```

These should be updated to return structured JSON responses consistent with the ecom module's format, with simple "Conflict" messages.

---

## 7. Implementation Plan

### Phase 1 — Critical & High (Do before launch)

| Step | Change | Files affected |
|------|--------|---------------|
| 1 | Implement logout: wire `revokeSession()` into logout stubs | `admin/services/auth.service.ts`, `employee/services/auth.service.ts` |
| 2 | Add logout route handlers to controllers | `admin/controllers/auth.controller.ts`, `employee/controllers/auth.controller.ts` |
| 3 | Register logout routes in router | `api/ecom/ecom.route.ts` |
| 4 | Install `express-rate-limit`, create rate limiter middleware | New: `src/modules/ecom/shared/rate-limiter.ts` |
| 5 | Apply rate limiters to all auth routes | `app.ts` |
| 6 | Add `httpOnly`, `secure`, `sameSite`, `signed` to all cookie writes | All `res.cookie()` calls across 4+ files |
| 7 | Configure `cookie-parser` with `COOKIE_SECRET` env var | `app.ts` |
| 8 | Update auth middleware to read `req.signedCookies.sid` | `auth/rbac/rbac.context.ts` |
| 9 | Wire Zod validation into admin signup controller | `admin/controllers/auth.controller.ts` |
| 10 | Fix password reset token not returned in response | `api/auth/password/jwt.service.ts` |

### Phase 2 — Medium priority

| Step | Change | Files affected |
|------|--------|---------------|
| 11 | Install `helmet`, add helmet middleware | `app.ts` |
| 12 | Install `cors`, configure CORS middleware | `app.ts`, `.env` |
| 13 | Set `express.json({ limit: "1mb" })` | `app.ts` |
| 14 | Create lockout service with Redis tracking | New: `src/modules/ecom/shared/lockout.ts` |
| 15 | Wire lockout checks into admin & employee auth services | `admin/services/auth.service.ts`, `employee/services/auth.service.ts` |
| 16 | Update password validation in Zod schemas (min 8, common check) | `validation/schemas/employee.schema.ts`, `validation/schemas/admin.schema.ts` |
| 17 | Create sanitization utility | New: `src/modules/ecom/shared/sanitize.ts` |
| 18 | Apply sanitization transforms to relevant Zod schemas | `validation/schemas/order.schema.ts`, others with text fields |
| 19 | Revoke old sessions on re-login | `session.service.ts` |

### Phase 3 — Low & Polish

| Step | Change | Files affected |
|------|--------|---------------|
| 20 | Fix email enumeration (generic error messages) | `admin/services/auth.service.ts`, `employee/services/auth.service.ts` |
| 21 | Clean up self-aware bad-practice comments in JWT auth | `api/auth/password/session.service.ts`, `api/auth/password/jwt.service.ts` |
| 22 | Add origin/referer CSRF check middleware | New: `src/modules/ecom/shared/csrf.ts` |
| 23 | Add `SENTRY_DSN`, `COOKIE_SECRET`, `CORS_ORIGIN` to `.env` | `.env` |
| 24 | Add `LOG_LEVEL`, `COOKIE_SECRET`, `CORS_ORIGIN` to deployment docs | Deployment config |

---

## 8. Migration Checklist

### Phase 1 — Ship-blocker fixes (do before going live)
- [ ] Implement `logoutAdmin()` — call `revokeSession(sid)`
- [ ] Implement `logoutEmployee()` — call `revokeSession(sid)`
- [ ] Add logout route handlers to admin controller
- [ ] Add logout route handlers to employee controller
- [ ] Register logout routes in `ecom.route.ts`
- [ ] Install `express-rate-limit` and `@types/express-rate-limit`
- [ ] Create `src/modules/ecom/shared/rate-limiter.ts`
- [ ] Apply `authLimiter` to all login/signup routes in `app.ts`
- [ ] Add `httpOnly: true` to all `res.cookie("sid", ...)` calls
- [ ] Add `secure: true` (conditionally by env) to all cookie calls
- [ ] Add `sameSite: "lax"` to all cookie calls
- [ ] Add `signed: true` to all cookie calls
- [ ] Configure `cookie-parser` with `COOKIE_SECRET` env var
- [ ] Update auth middleware to use `req.signedCookies.sid`
- [ ] Wire `validateAdminSignup` into admin auth controller
- [ ] Fix password reset token endpoint (don't return token in response)
- [ ] Add `COOKIE_SECRET` to `.env`

### Phase 2 — Hardening
- [ ] Install `helmet` and add `app.use(helmet())`
- [ ] Install `cors` and `@types/cors`, configure CORS
- [ ] Set `express.json({ limit: "1mb" })`
- [ ] Create `src/modules/ecom/shared/lockout.ts`
- [ ] Wire `checkLockout`, `recordFailedAttempt`, `clearLockout` into auth services
- [ ] Update employee password schema: `min(8)`
- [ ] Create admin signup schema (currently missing)
- [ ] Create `src/modules/ecom/shared/sanitize.ts`
- [ ] Apply `sanitizeString` transforms to text-field schemas
- [ ] Revoke old sessions on re-login

### Phase 3 — Information leakage & CSRF
- [ ] Fix email enumeration (generic "Invalid email or password" for both cases)
- [ ] Fix "Already exists" leak in JWT auth endpoints
- [ ] Add origin/referer CSRF check middleware
- [ ] Add `CORS_ORIGIN` to `.env`
- [ ] Add `LOG_LEVEL` to `.env`

---

## 9. What Good Looks Like

### Before (current state)

```
POST /api/ecom/admin/login
→ Cookie set without httpOnly/secure/sameSite
→ No rate limiting (can send 10000 requests/minute)
→ Wrong password: "No Admin found" (reveals email exists)
→ Session created, old one not revoked
→ Logout does nothing

POST /api/ecom/admin/signup
→ req.body cast as AdminData with no validation
→ Password "a" accepted
→ No rate limiting
```

### After

```
POST /api/ecom/admin/login
→ Rate limited: 10 req/min per IP
→ Cookie: httpOnly, secure, sameSite=lax, signed
→ Wrong password: "Invalid email or password" (same for not-found)
→ Old sessions revoked
→ Lockout after 5 failed attempts: 15 min cooldown

POST /api/ecom/admin/signup
→ Zod schema validates every field
→ Password min 8 chars, common password check
→ Rate limited
→ Cookie with full security flags

POST /api/ecom/admin/logout
→ Session revoked in Redis + DB
→ Cookie cleared
→ 200 response

All endpoints:
→ helmet security headers
→ CORS restricted to configured origin
→ Body size limited to 1MB
→ Text fields sanitized
→ CSRF protected via sameSite + origin check
```

---

## 10. Additional Resources

- [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/)
- [OWASP Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Express security best practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [helmet documentation](https://helmetjs.github.io/)
- [express-rate-limit documentation](https://express-rate-limit.mintlify.app/)
- [SameSite cookie explained](https://web.dev/articles/samesite-cookies-explained)

---

*This plan addresses the 19 findings from the security audit. Phase 1 fixes are ship-blockers — deploy nothing to production until they're done.*
