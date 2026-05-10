## Confirm Order Validity

### Actors

- Employee

### Description

Employee verifies an order is valid and confirmable for processing.

### Preconditions

- Employee is authenticated
- Order is assigned to the employee
- Order is in Pending status

### Trigger

- Employee clicks "Confirm" on an assigned order

### Main Flow

1. Employee reviews order details (customer, items, address)
2. Employee validates order information
3. Employee confirms order validity
4. System updates order status to Confirmed
5. Inventory stock is decremented

### Alternate Flows

A1. Order invalid => Employee rejects order
A2. Insufficient stock => System notifies employee

### Postconditions

- Success: Order status updated to Confirmed
- Failure: Order remains in Pending status
