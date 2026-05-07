# Employee Payment System – Full Use Case Specification

## 1. System Overview

This system manages employee compensation in a COD (Cash on Delivery) business model with two payment methods:

- **SALARY** (fixed periodic payment)
- **PER_ORDER** (payment per completed order)

It supports:

- Changing payment type at any time
- Updating rates over time
- Preserving full history
- Calculating payroll per period
- Tracking actual payments (ledger)

---

## 2. Core Concepts

### 2.1 Payment Type

Defines the compensation model:

- `SALARY`
- `PER_ORDER`

This is static configuration data.

---

### 2.2 Payment Contract (Core Entity)

Represents how an employee is paid over a time period.

**Fields:**

- employeeId
- paymentTypeId
- salaryAmount (nullable)
- perOrderRate (nullable)
- effectiveFrom
- effectiveTo
- isActive

**Rules:**

- Only one active contract per employee at a time
- Contracts are never deleted
- Contracts are versioned over time
- Every change creates a new contract

---

### 2.3 Employee Payment (Ledger)

Represents real money paid to employees.

**Fields:**

- employeeId
- amount
- paymentPeriod (optional label)
- paymentDate
- notes
- contractId (optional snapshot reference)

**Rules:**

- Immutable after creation
- Represents real financial transactions
- Independent from contracts

---

## 3. Use Cases

---

## 3.1 Assign Initial Payment Type

**Actor:** Admin

**Flow:**

1. Admin selects employee
2. Chooses payment type
3. Sets salary or per-order rate
4. System creates first contract

**Rule:**

- Never update employee directly
- Always create contract

---

## 3.2 Change Payment Type (SALARY → PER_ORDER)

**Flow:**

1. Close current contract:
   - set `effectiveTo = now`
   - set `isActive = false`
2. Create new contract with new type
3. Set new rate (perOrderRate)

**Rule:**

- Old contract remains for history
- No overwriting allowed

---

## 3.3 Change Rate (Same Payment Type)

Example: salary 50,000 → 60,000

**Flow:**

1. Close current contract
2. Create new contract with updated value

---

## 3.4 Monthly Payroll Calculation

**Input:**

- employeeId
- startDate
- endDate

**Process:**

1. Fetch contracts overlapping period
2. For each contract:

### If SALARY:

- add salary (or prorated if required)

### If PER_ORDER:

- count orders in period
- multiply by perOrderRate

**Output:**

- total earnings for period

---

## 3.5 Create Payment (Payout)

**Flow:**

1. Calculate total salary
2. Admin confirms payment
3. Insert EmployeePayment record

**Rule:**

- Payment is final and immutable
- Optional link to contract snapshot

---

## 3.6 Partial Payments

**Case:**
Employee is paid in multiple installments

**Solution:**

- Multiple EmployeePayment records allowed
- System tracks total paid vs total due

---

## 3.7 Retroactive Changes

**Rule:**

- Never modify past contracts

Instead:

- create adjustment contract (future)
- or correction payment record

---

## 3.8 Mid-Month Switching

Example:
SALARY → PER_ORDER on day 10

**Options:**

- Pro-rate salary + orders (advanced)
- Or apply rule-based split

System must define one consistent policy.

---

## 4. Business Rules Summary

### Contracts

- Immutable history
- Only one active at a time
- Always versioned

### Payments

- Immutable ledger
- Represents real money only

### Payroll Calculation

- Derived data (not stored as source of truth)

---

## 5. Edge Cases

### No Active Contract

- Payroll calculation fails

### Overlapping Contracts

- Invalid state (must be prevented)

### Missing Rate

- Calculation error

### Deleted Employee

- Payments remain for audit

---

## 6. System Guarantees

- Full audit trail
- No data loss on updates
- Safe switching between payment models
- Reproducible payroll history
- Scalable for future bonuses/deductions

---

## 7. Mental Model

| Concept  | Meaning             |
| -------- | ------------------- |
| Contract | Rules over time     |
| Orders   | Work performed      |
| Payroll  | Calculated earnings |
| Payment  | Actual money paid   |

---

## 8. Future Extensions

- Bonuses per order
- Deductions (penalties, delays)
- Commissions
- Monthly payroll locking
- Automated payroll jobs
- Employee performance tracking

---
