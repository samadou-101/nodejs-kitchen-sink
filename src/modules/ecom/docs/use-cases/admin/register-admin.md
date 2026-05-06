# Register Admin

## Actors

- Admin

## Description

Admin Registration

## Preconditions

- Admin record is pre-created by dev/superadmin
- Email is marked as admin-pending

## Trigger

- Admin submits registration form

## Main Flow

1. Admin enters(name, email, password)
2. System validates form
3. System checks email exists in pre-approved list
4. System activates account
5. Assign role = admin

# Alternate Flows

2a. Email not pre-approved => reject
2b. Email already activated => reject

## Postconditions

- Admin account activated and usable
