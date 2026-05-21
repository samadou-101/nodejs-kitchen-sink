## 1. Logger Configuration

- [x] 1.1 Change default log level from `"debug"` to `"warn"` in `src/modules/ecom/shared/logger.ts`
- [x] 1.2 Configure pino-http to only auto-log 5xx responses in `src/app.ts` (set `autoLogging.ignore` to suppress 2xx/3xx/4xx)

## 2. Replace console.log in Session Service

- [x] 2.1 Remove `console.log("testing session")` from `src/modules/ecom/auth/session/session.service.ts:13`
- [x] 2.2 Replace `console.log(error)` in `loginUserSession` with `logger.error` at `src/modules/ecom/auth/session/session.service.ts:98`
- [x] 2.3 Replace `console.log("Error creation the session", error.message)` with `logger.error` at line 123
- [x] 2.4 Replace `console.log("Failed to cache session", error.meessage)` with `logger.error` at line 135
- [x] 2.5 Replace `console.log("Error Updating the session", error.message)` with `logger.error` at line 195
- [x] 2.6 Replace `console.log("Error fetching the user session")` with `logger.error` at line 209

## 3. Clean Up Noisy Debug Logs

- [x] 3.1 Remove `logger.debug({ inPendingList }, "Pending admin check")` from `src/modules/ecom/admin/services/auth.service.ts:19`
- [x] 3.2 Remove `logger.debug({ email }, "Checking pending list from repo")` from `src/modules/ecom/admin/repo/employee.repo.ts:12`

## 4. Improve Error Middleware Logging

- [x] 4.1 Replace `(req.log ?? logger).error({ err }, "Unhandled error")` with concise error logging that does not dump full stack traces — log the error message and request context instead

## 5. Improve Order Service Error Logging

- [x] 5.1 Update `logger.error({ err: error, orderId }, "[updateOrderStatus] Error")` in `src/modules/ecom/order/order.service.ts:241` to use a clearer message and avoid double-logging (error is re-thrown and caught by error middleware)

## 6. Clean Up RBAC Context Logging

- [x] 6.1 Replace `logger.error({ err: error }, "Authentication error")` in `src/modules/ecom/auth/rbac/rbac.context.ts:35` with concise message and request-level context

## 7. Verify Changes

- [x] 7.1 Run `pnpm dev` and verify the server starts without errors
- [x] 7.2 Hit a few API endpoints and confirm no request-level logs appear for 2xx/4xx responses
- [x] 7.3 Trigger a 5xx error and verify it logs at error level with a clear message
- [ ] 7.4 Switch `LOG_LEVEL=debug`, restart, and verify debug-level details (stack traces) are available
