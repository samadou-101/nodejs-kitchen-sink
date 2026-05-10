## View Assigned Orders

### Actors

- Employee

### Description

Employee views all orders assigned to them for verification.

### Preconditions

- Employee is authenticated
- Orders are assigned to the employee by admin

### Trigger

- Employee opens their orders list

### Main Flow

1. Employee requests assigned orders list
2. System displays orders with details (customer info, items, status)
3. Employee selects an order to review

### Postconditions

- Success: Employee sees their assigned orders list
