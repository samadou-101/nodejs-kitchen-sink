## Reject Order

### Actors

- Employee

### Description

Employee rejects an order that is invalid or cannot be fulfilled.

### Preconditions

- Employee is authenticated
- Order is assigned to the employee
- Order is in Pending status

### Trigger

- Employee clicks "Reject" on an assigned order

### Main Flow

1. Employee reviews order details
2. Employee identifies issue (invalid address, unreachable customer, etc.)
3. Employee rejects order with optional reason/notes
4. System updates order status to Cancelled

### Alternate Flows

A1. Order already processed => reject not allowed

### Postconditions

- Success: Order status updated to Cancelled
