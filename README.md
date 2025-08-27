# ERP Express - Gerant Employee Assignment Feature

## Overview

This feature allows users with the "Gerant" role to be assigned specific employees and view only the bon de commande (purchase orders) from those assigned employees.

## New Features

### 1. Gerant Employee Assignment

- When creating or editing a user with the "Gerant" role, a new section appears allowing the selection of employees to assign to that Gerant
- The Gerant can only see bon de commande from their assigned employees
- Admin and Responsible users can still see all bon de commande

### 2. Database Changes

- New `GerantEmployeeAssignment` table to track which employees are assigned to which Gerant users
- Updated User and Employee models with new relations

### 3. API Endpoints

- `GET /api/users/employees` - Get all employees for assignment
- `GET /api/users/gerant/:id/employees` - Get employees assigned to a specific Gerant
- Updated user creation/update endpoints to handle employee assignments

### 4. Frontend Components

- Updated UserFormCard to show employee selection when Gerant role is chosen
- Updated UserActionCard to display assigned employees for Gerant users
- New Checkbox component for employee selection

## How to Use

1. **Create a Gerant User:**

   - Go to User Management → Users
   - Click "Add User"
   - Select "Gerant" as the role
   - A new section will appear showing all available employees
   - Check the employees you want to assign to this Gerant
   - Save the user

2. **Edit a Gerant User:**

   - Click on a Gerant user in the users table
   - The assigned employees will be displayed
   - Click "Edit User" to modify assignments

3. **View Bon de Commande:**
   - Gerant users will only see bon de commande from their assigned employees
   - Admin and Responsible users see all bon de commande

## Technical Implementation

### Database Schema

```sql
model GerantEmployeeAssignment {
  id          String   @id @default(uuid())
  gerant_id   String   // User ID of the Gerant
  employee_id String   // Employee ID that is assigned to the Gerant
  created_at  DateTime @default(now())

  gerant      User     @relation("GerantAssignments", fields: [gerant_id], references: [id], onDelete: Cascade)
  employee    Employee @relation(fields: [employee_id], references: [id], onDelete: Cascade)

  @@unique([gerant_id, employee_id])
}
```

### Key Components

- `UserFormCard.tsx` - Handles employee selection UI
- `UserActionCard.tsx` - Shows assigned employees for Gerant users
- `BonDeCommandeService.ts` - Filters bon de commande by assigned employees
- `UserService.ts` - Manages Gerant-Employee assignments

## Security

- Only Admin and Responsible users can assign employees to Gerant users
- Gerant users can only see bon de commande from their assigned employees
- All assignments are validated on both frontend and backend
