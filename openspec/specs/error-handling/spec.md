## Purpose

Ensure errors with nested `.cause` chains are properly unwrapped, classified, and logged so that root cause information is surfaced in both logs and error responses.

## Requirements

### Requirement: Error cause unwrapping

The error middleware SHALL unwrap the error `.cause` chain to find the root error before performing classification and logging.

#### Scenario: Single level cause unwrapping

- **WHEN** the middleware receives an `Error` whose `.cause` is a `Prisma.PrismaClientKnownRequestError`
- **THEN** the middleware SHALL classify the error using the `Prisma.PrismaClientKnownRequestError` instance, not the wrapper

#### Scenario: Multiple levels of cause nesting

- **WHEN** the middleware receives an `Error` whose `.cause` is another `Error`, whose `.cause` is a `ZodError`
- **THEN** the middleware SHALL traverse the chain and classify using the innermost `Error`

#### Scenario: Non-Error cause

- **WHEN** the middleware receives an `Error` whose `.cause` is a plain object or string
- **THEN** the middleware SHALL classify the outer `Error` and SHALL NOT attempt to unwrap

### Requirement: Rich error logging

The middleware SHALL log the root cause details alongside the wrapper message when an error has a `.cause` chain.

#### Scenario: Log includes root cause details

- **WHEN** the middleware logs an error with a `.cause` chain
- **THEN** the log entry SHALL include the root error's message, name, and (if available) code and metadata

#### Scenario: No `.cause` present

- **WHEN** the middleware receives a plain error with no `.cause`
- **THEN** the log format SHALL remain unchanged (single message, no cause fields)

### Requirement: Proper classification of wrapped errors

The middleware SHALL produce appropriate HTTP status codes and error codes for wrapped errors based on the root cause type.

#### Scenario: Wrapped Prisma P2002 yields 409 Conflict

- **WHEN** a service throws `new Error("msg", { cause: Prisma.P2002 error })`
- **THEN** the middleware SHALL respond with `409 Conflict` and error code `CONFLICT`

#### Scenario: Wrapped AppError preserves its status code

- **WHEN** a service throws `new Error("msg", { cause: NotFoundError })`
- **THEN** the middleware SHALL respond with the `NotFoundError`'s status code (`404`) and code (`NOT_FOUND`)
