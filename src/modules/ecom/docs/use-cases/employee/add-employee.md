## Add Employee

### Actors

- Admin
- Employee

### Description

Admin invites a new employee via email

### Preconditions

- Admin is authenticated
- Admin has required permissions

### Trigger

- Admin submits employee email from the panel

### Main Flow

1. Admin enters employee's email
2. System sends invitation link
3. Employee opens link
4. Employee completes registration
5. System creates employee account
6. Employee account is activated

### Alternate Flows

A1. Email invalid => show error
A2. Email already exists => notify admin
A3. Link expired => resend invitation

### Postconditions

- Success: Employee account created and activated
- Failure: No account created
