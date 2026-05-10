## Add Order Notes

### Actors

- Employee

### Description

Employee adds confirmation notes to an order during verification.

### Preconditions

- Employee is authenticated
- Order is assigned to the employee

### Trigger

- Employee adds notes while reviewing an order

### Main Flow

1. Employee reviews order details
2. Employee enters confirmation notes (optional observations)
3. Employee submits notes
4. System saves notes to order

### Postconditions

- Success: Notes attached to order
