## Why

The `getAllEmployees()` query in `employee.repo.ts` uses `contracts` as a Prisma include key on the `Employee` model, but the schema defines this relation as `employeePaymentContracts`. This causes a `PrismaClientValidationError` at runtime when the endpoint `GET /api/ecom/admin/employees` is called.

## What Changes

- Rename `contracts` to `employeePaymentContracts` in the `getAllEmployees()` include block in `employee.repo.ts:302`
- Also alias the included relation to `contracts` in the result type (via Prisma's `$set`) if callers depend on the `contracts` key name; otherwise just fix the field name

## Capabilities

### New Capabilities

None — this is a bug fix, not a new feature.

### Modified Capabilities

None — no spec-level behavior change.

## Impact

- `src/modules/ecom/admin/repo/employee.repo.ts` — single line change in `getAllEmployees()`
- Any code consuming the result of `getAllEmployees()` that references `contracts` instead of `employeePaymentContracts` would also need updating
