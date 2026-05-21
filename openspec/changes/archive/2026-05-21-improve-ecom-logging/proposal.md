## Why

The ecom module logs every HTTP request with full traces and scatters `console.log` calls throughout the codebase. This produces noisy, unstructured output that obscures real errors, includes security-sensitive data, and makes debugging harder. Logging should contain only clear error messages.

## What Changes

- Disable pino-http auto-logging for successful requests (only log errors at `warn`+ level)
- Replace all `console.log` calls with structured Pino logger calls
- Remove or demote noisy debug-level logs (`logger.debug`) that add no diagnostic value
- Ensure error logs are concise: log a clear message with minimal structured context (no full stack traces in dev, include them only on demand)
- Fix security issue: remove `console.log(resetToken + " " + email + " " + newPassword)` and similar credential exposure
- Add `LOG_LEVEL` env var documentation; default to `"warn"` instead of `"debug"` in development

## Capabilities

### New Capabilities
- `error-logging`: Structured, minimal-error logging policy for the ecom module — only error-level messages with clear, actionable context

### Modified Capabilities

None — no existing specs to modify.

## Impact

- `src/app.ts` — pino-http middleware configuration changes
- `src/modules/ecom/shared/logger.ts` — default log level, error-only serialization
- `src/modules/ecom/shared/error.middleware.ts` — cleaner error serialization
- `src/modules/ecom/auth/session/session.service.ts` — replace 7+ `console.log` calls
- `src/modules/ecom/auth/rbac/rbac.context.ts` — cleaner error logging
- `src/modules/ecom/auth/rbac/rbac.seed.ts` — info logs stay, no change needed
- `src/modules/ecom/order/order.service.ts` — keep existing logger.error, improve message
- `src/modules/ecom/admin/services/auth.service.ts` — remove noisy debug log
- `src/modules/ecom/admin/repo/employee.repo.ts` — remove noisy debug log
- No new dependencies; relies on existing Pino logger
