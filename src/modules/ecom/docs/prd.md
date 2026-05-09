# Minimal PRD — COD Algeria E-commerce + Employee System

## Goal

Build a simple COD (Cash on Delivery) e-commerce platform for Algeria with internal employee management focused on order confirmation and operational validation.

---

## Core Users

- Customer
- Admin (Owner)
- Employee (Order Confirmation Staff)

---

## Customer Side

### Features

- Browse products (categories + search)
- View product details
- Add to cart
- Checkout form:
  - Full name
  - Phone number
  - Address
  - City
  - Notes (optional)
- Place order (COD only)
- Track order status:
  - Pending
  - Confirmed
  - Shipped
  - Delivered
  - Cancelled

---

## Admin Side

### Product Management

- Create / update / delete products
- Manage categories
- Basic stock tracking

### Order Management

- View all orders
- Assign orders to employees (for confirmation review)
- Confirm / cancel orders
- Update order status

### Employee Management

- Create / edit / deactivate employees
- Assign payment type:
  - Fixed salary
  - Per-order commission
- View employee performance

### Payroll Management

- Track employee earnings
- Generate payroll per period
- Mark payroll as paid
- View payment history

---

## Employee Side

### Features

- View assigned orders
- Confirm or reject order validity (verification only)
- Add confirmation notes (optional)
- No delivery responsibilities

---

## Employee Model

- Name
- Phone number
- Role: Order Confirmation
- Payment type:
  - salary
  - per_order_rate
- Status (active / inactive)

---

## Payroll Logic

### Salary Employees

- Fixed monthly salary

### Per-order Employees

- Earnings = confirmed valid orders × rate

### Admin Control

- Admin reviews and confirms payroll
- Admin marks payments as paid

---

## Constraints

- COD only (no online payments)
- No OTP or customer authentication complexity
- Employees only handle order confirmation (no logistics/delivery)
- Admin is the system authority for all decisions

---

## Non-Goals (MVP)

- No delivery tracking system
- No GPS or logistics optimization
- No automated payroll system
- No HR/legal contract management
- No wallet or subscription system
