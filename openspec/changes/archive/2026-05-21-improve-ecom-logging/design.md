## Context

The ecom module uses Pino for structured logging with pino-http middleware that logs every HTTP request. Additionally, 7+ files scatter `console.log` calls for debugging, including sensitive data exposure (plaintext reset tokens and passwords). The current default log level is `"debug"` in development, producing excessive noise that buries real errors.

No log aggregation or shipping infrastructure exists — logs go to stdout/stderr only.

## Goals / Non-Goals

**Goals:**
- Default log level to `"warn"` so only warnings and errors appear by default
- pino-http should only log requests that result in server errors (5xx) or warnings
- All `console.log` calls replaced with structured `logger.error` or removed
- Error messages are concise: message string + minimal structured context (e.g., `{ orderId, err }`)
- Full stack traces omitted from pino-pretty output by default (available via `LOG_LEVEL=debug`)
- Security-sensitive data never appears in logs

**Non-Goals:**
- Not adding log aggregation, log shipping, or external monitoring
- Not changing the Pino library or log format
- Not adding new error categories or alerting
- Not auditing non-ecom modules (src/api/auth/*, config/*) unless they directly affect ecom

## Decisions

**1. Default log level: `"warn"` in all environments**
- `"debug"` floods output even in dev; errors are what matter for debugging issues
- Developers can override via `LOG_LEVEL=debug` when they need detail
- Production stays at `"warn"`
- *Alternative considered:* `"info"` — still too noisy for a dev workflow

**2. pino-http autoLogging: only log errors**
- Use pino-http's `autoLogging.ignore` to suppress successful requests (2xx, 3xx, 4xx)
- Only requests ending in 5xx will be logged automatically
- *Alternative considered:* Remove pino-http entirely — loses the ability to correlate request IDs with error logs. Keeping it with error-only mode retains correlation without noise.

**3. Replace all `console.log` with `logger.error` (or remove)**
- Every `console.log` in ecom module files is either an error path (should be `logger.error`) or a debug trace (should be removed)
- Security-sensitive logs (reset token, password) must be removed entirely
- Use `logger.error({ ...context }, "Human-readable message")` pattern

**4. Remove noisy debug logs from service/repo files**
- `logger.debug({ inPendingList }, "Pending admin check")` in auth.service.ts — too granular, remove
- `logger.debug({ email }, "Checking pending list from repo")` in employee.repo.ts — too granular, remove
- `console.log("testing session")` — remove entirely

**5. Error serialization: concise, no full traces**
- Pino's `err` serializer includes full stack by default
- For the error middleware, pass `{ message: err.message, ...context }` instead of `{ err }` to avoid dumping stack traces
- Keep stack traces available when `LOG_LEVEL=debug` is set (conditional serialization)

**6. Fix the reset token/password exposure**
- `jwt.service.ts` line 160 logs `resetToken + " " + email + " " + newPassword` — remove entirely
- This is a security vulnerability, not just a logging concern

## Risks / Trade-offs

- **[Loss of debug visibility]** Developers who relied on the debug-level logs will need to use `LOG_LEVEL=debug` — mitigated by documenting this in AGENTS.md
- **[Missing error context]** Removing full stack traces might make some errors harder to diagnose — mitigated by keeping them available under `LOG_LEVEL=debug` and including key identifiers (orderId, userId, etc.) in the log message
- **[console.log in non-ecom files]** The `console.log` calls in `src/api/auth/*` and `src/config/*` are outside scope — they'll remain noisy until addressed separately
