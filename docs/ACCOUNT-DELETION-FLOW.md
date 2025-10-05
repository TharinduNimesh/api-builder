# Account Deletion & Project Reset Flow

## Overview
This document outlines the enhanced account deletion and project reset functionality with different behaviors for project owners vs regular users.

## Key Features

### 🔑 Owner Actions

#### Reset Project
- **What it does:**
  - Deletes all tables
  - Deletes all functions
  - Deletes all query history
  - Deletes all SQL snippets
  - Resets roles to empty array
  - Disables role management
  
- **Navigation:** Redirects to `/setup-project` after completion
- **Warning:** Shows detailed confirmation dialog
- **Authorization:** Only available to project owner

#### Delete Account (Owner)
- **What it does:**
  1. Automatically resets project (same as Reset Project)
  2. Permanently deletes the owner's account
  3. Cascades to delete the entire project
  4. Cascades to delete all related data
  
- **Navigation:** Redirects to `/signin` after completion
- **Warning:** 
  - Shows comprehensive warning with bullet points
  - Requires typing "DELETE" to confirm
  - Explains that the entire project will be deleted
- **Authorization:** Only available to project owner

### 👤 Regular User Actions

#### Deactivate Account
- **What it does:**
  - Sets `is_active` to `false` in database
  - Account remains in database (not deleted)
  - Can be reactivated by owner
  - Does NOT affect the project
  - Does NOT affect other users
  
- **Navigation:** Redirects to `/signin` after completion
- **Warning:** Shows simple confirmation explaining deactivation
- **Authorization:** Available to all active users

## UI Differences

### Danger Zone Section

**For Owner:**
```
┌─────────────────────────────────────────────┐
│ ⚠️  Danger Zone                             │
│ Irreversible and destructive actions        │
├─────────────────────────────────────────────┤
│ Reset Project                    [Reset]    │
│ Clear all tables, functions, query history  │
├─────────────────────────────────────────────┤
│ Delete Account & Project        [Delete]    │
│ Permanently delete your account, project,   │
│ and all associated data                     │
└─────────────────────────────────────────────┘
```

**For Regular User:**
```
┌─────────────────────────────────────────────┐
│ ⚠️  Danger Zone                             │
│ Irreversible and destructive actions        │
├─────────────────────────────────────────────┤
│ Deactivate Account           [Deactivate]   │
│ Deactivate your account (can be             │
│ reactivated by owner)                       │
└─────────────────────────────────────────────┘
```

## Confirmation Dialogs

### Reset Project Dialog
```
Title: Reset Project
Description: This will delete all tables, functions, query history, 
SQL snippets, and reset roles. You will be redirected to the setup 
page. This action cannot be undone. Are you sure you want to continue?

Actions: [Cancel] [Reset Project]
```

### Delete Account Dialog (Owner)
```
Title: Delete Account & Project

⚠️ Warning: This is a destructive action!

As the project owner, deleting your account will:
• Permanently delete the entire project
• Delete all tables, functions, and data
• Remove all query history and SQL snippets
• Permanently delete your account

Type DELETE to confirm:
[_________________]

Actions: [Cancel] [Delete Account & Project]
```

### Deactivate Account Dialog (Regular User)
```
Title: Deactivate Account

Description: Your account will be deactivated. You won't be able 
to access the system until the project owner reactivates your 
account. This will not affect the project or other users.

Actions: [Cancel] [Deactivate Account]
```

## Backend Implementation

### Reset Project Endpoint
```typescript
// POST /api/settings/reset
// Authorization: Owner only (ensureProjectOwner middleware)

1. Verify user is project owner
2. Get all tables and functions from database
3. Drop all tables from PostgreSQL (DROP TABLE ... CASCADE)
4. Drop all functions from PostgreSQL (DROP FUNCTION ... CASCADE)
5. Delete all table records (sysTable)
6. Delete all function records (sysFunction)
7. Delete all query history (sysQueryHistory)
8. Delete all SQL snippets (sysSqlSnippet)
9. Update project: roles = [], enable_roles = false
10. Return success message
```

### Delete Account Endpoint
```typescript
// DELETE /api/settings/account
// Authorization: All authenticated users

if (isOwner) {
  1. Get all tables and functions from database
  2. Drop all tables from PostgreSQL (DROP TABLE ... CASCADE)
  3. Drop all functions from PostgreSQL (DROP FUNCTION ... CASCADE)
  4. Delete all table records
  5. Delete all function records
  6. Delete all query history
  7. Delete all SQL snippets
  8. Delete all other users (not owner)
  9. Delete owner account (cascades to delete project)
  10. Return { message, isOwner: true }
} else {
  1. Update user: is_active = false
  2. Return { message, isOwner: false }
}
```

## Navigation Flow

```
Owner Reset Project:
Settings → [Click Reset] → [Confirm] → /setup

Owner Delete Account:
Settings → [Click Delete] → [Type DELETE] → [Enable Button] → [Confirm] → /signin

Regular User Deactivate:
Settings → [Click Deactivate] → [Confirm] → /signin
```

## Database Impact

### Owner Delete Account
```sql
-- Step 1: Drop actual database objects
DROP TABLE IF EXISTS schema.table1 CASCADE;
DROP TABLE IF EXISTS schema.table2 CASCADE;
-- ... for each table

DROP FUNCTION IF EXISTS schema.function1 CASCADE;
DROP FUNCTION IF EXISTS schema.function2 CASCADE;
-- ... for each function

-- Step 2: Clear system tracking tables
DELETE FROM sys_table;
DELETE FROM sys_function;
DELETE FROM sys_query_history;
DELETE FROM sys_sql_snippet;

-- Step 3: Delete all other users
DELETE FROM sys_user WHERE id != ?;

-- Step 4: Delete owner (cascades to delete project)
DELETE FROM sys_project WHERE createdById = ?;
DELETE FROM sys_refresh_token WHERE userId = ?;
DELETE FROM sys_user WHERE id = ?;
```

### Regular User Deactivate
```sql
-- Simple update, no deletions
UPDATE sys_user SET is_active = false WHERE id = ?;
```

## Security Considerations

1. **Owner Verification:** All destructive actions verify owner status
2. **Middleware Protection:** `ensureProjectOwner` middleware on owner-only routes
3. **Confirmation Required:** Text confirmation ("DELETE") for owner account deletion
4. **Cascade Safety:** Database cascade rules handle related record cleanup
5. **Soft Delete for Users:** Regular users use soft delete (is_active flag)

## Success Messages

| Action | Owner | Regular User |
|--------|-------|--------------|
| Reset Project | "Project reset successfully" | N/A |
| Delete Account | "Account and project deleted successfully" | N/A |
| Deactivate | N/A | "Account deactivated successfully" |

## Error Handling

All operations include:
- Try-catch blocks with Prisma error mapping
- User-friendly error messages via `notifyError()`
- Loading states during async operations
- Disabled buttons while saving

## Future Enhancements

- [ ] Admin panel to reactivate deactivated users
- [ ] Email notifications before account deactivation
- [ ] Grace period before permanent deletion
- [ ] Export data before account deletion
- [ ] Audit log for destructive actions
