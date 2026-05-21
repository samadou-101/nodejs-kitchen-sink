## ADDED Requirements

### Requirement: Default log level is warn
The system SHALL default to `"warn"` log level in both development and production environments. The `LOG_LEVEL` environment variable SHALL override this default.

#### Scenario: Default log level in development
- **WHEN** `NODE_ENV` is `"development"` and `LOG_LEVEL` is not set
- **THEN** the logger SHALL use `"warn"` as the log level

#### Scenario: LOG_LEVEL override
- **WHEN** the `LOG_LEVEL` environment variable is set to `"debug"`
- **THEN** the logger SHALL use `"debug"` as the log level

### Requirement: pino-http only logs server errors
The pino-http middleware SHALL only automatically log HTTP requests that result in a 5xx status code. Successful requests (2xx, 3xx, 4xx) SHALL NOT produce automatic log entries.

#### Scenario: Successful request is not logged
- **WHEN** a request completes with a 2xx or 3xx status code
- **THEN** pino-http SHALL NOT produce a log entry for that request

#### Scenario: Server error is logged
- **WHEN** a request completes with a 5xx status code
- **THEN** pino-http SHALL produce a log entry with level `"error"`

### Requirement: No console.log in ecom module
The ecom module source files SHALL NOT use `console.log`. All logging SHALL go through the structured Pino logger.

#### Scenario: Error path uses logger.error
- **WHEN** an error occurs in session creation
- **THEN** the system SHALL use `logger.error()` instead of `console.log()`

#### Scenario: Debug trace does not log to console
- **WHEN** a debug trace is no longer needed
- **THEN** the `console.log` call SHALL be removed, not replaced with a logger call

### Requirement: Error messages are concise
Error log messages SHALL include a clear human-readable message and minimal structured context (e.g., identifiers like orderId, userId). Full stack traces SHALL NOT appear in default log output.

#### Scenario: Error logged with context
- **WHEN** an error occurs in `updateOrderStatus`
- **THEN** the log entry SHALL contain a message like `"Failed to update order status"` and structured context `{ orderId }`

#### Scenario: Stack trace available on demand
- **WHEN** `LOG_LEVEL` is set to `"debug"`
- **THEN** the logger SHALL include full stack traces in error output

### Requirement: No sensitive data in logs
The system SHALL NOT log passwords, reset tokens, or authentication secrets in any log output.

#### Scenario: Reset token not logged
- **WHEN** a password reset flow executes
- **THEN** the reset token, email, and new password SHALL NOT appear in any log output
