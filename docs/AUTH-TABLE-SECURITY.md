# Authentication Table Security Restrictions

## Overview
Enhanced security measures to prevent builders from accessing sensitive authentication tables (`AppUserAuth` and `AppRefreshToken`) through SQL queries, functions, and table operations.

## Security Rationale
These tables contain sensitive authentication data:
- **AppUserAuth**: Stores hashed passwords and authentication provider information
- **AppRefreshToken**: Contains refresh tokens used for authentication sessions

Allowing direct access to these tables could lead to:
- Password hash exposure
- Token theft
- Authentication bypass vulnerabilities
- Unauthorized access to user accounts

## Implementation Date
October 15, 2025

---

## Changes Made

### 1. SQL Validator (`backend/src/utils/sqlValidator.ts`)

#### New Function: `hasAppAuthTableAccess()`
```typescript
function hasAppAuthTableAccess(sql: string): boolean {
  const patterns = [
    /\b(from|join|into|update|delete\s+from|insert\s+into)\s+(["\`]?appuserauth|["\`]?apprefreshtoken)/gi,
    /\b(from|join|into|update|delete\s+from|insert\s+into)\s+(["\`]?public["\`]?\.["\`]?(appuserauth|apprefreshtoken)["\`]?)/gi,
    /\b(from|join|into|update|delete\s+from|insert\s+into)\s+(["\`]?"AppUserAuth"|["\`]?"AppRefreshToken")/gi,
    /\b(from|join|into|update|delete\s+from|insert\s+into)\s+(["\`]?public["\`]?\.["\`]?("AppUserAuth"|"AppRefreshToken")["\`]?)/gi,
  ];

  return patterns.some(pattern => pattern.test(sql));
}
```

#### Updated Validation Check
```typescript
// 2.1. Block sensitive App* auth tables
if (hasAppAuthTableAccess(normalizedSQL)) {
  errors.push('Direct access to authentication tables (AppUserAuth, AppRefreshToken) is not allowed for security reasons');
}
```

#### Coverage
Detects and blocks:
- Direct table references: `SELECT * FROM AppUserAuth`
- Schema-qualified references: `SELECT * FROM public.AppUserAuth`
- Case variations: `appuserauth`, `AppUserAuth`, `APPUSERAUTH`
- Quoted identifiers: `"AppUserAuth"`, `'AppUserAuth'`
- JOIN operations: `JOIN AppUserAuth ON ...`
- INSERT/UPDATE/DELETE operations

---

### 2. Function Validator (`backend/src/utils/functionValidator.ts`)

#### Pattern Matching
```typescript
// Check for direct table references
const appAuthTablePattern = /\b(from|join|into|update|delete\s+from|insert\s+into)\s+(["`]?(appuserauth|apprefreshtoken))/gi;

// Check for quoted identifiers
const quotedAppAuthPattern = /["'`](appuserauth|apprefreshtoken|AppUserAuth|AppRefreshToken)["'`]/gi;
```

#### Error Messages
- **Direct reference**: `"Access to authentication tables (AppUserAuth, AppRefreshToken) is not allowed for security reasons. Functions cannot query, modify, or reference sensitive authentication tables."`
- **Quoted identifier**: `"Access to authentication table "{tableName}" is not allowed for security reasons"`

#### Coverage
Prevents function creation that:
- Queries auth tables: `SELECT * FROM AppUserAuth WHERE ...`
- Modifies auth data: `UPDATE AppRefreshToken SET ...`
- Joins with auth tables: `JOIN AppUserAuth ON ...`
- References in any clause

---

### 3. Table Service (`backend/src/services/table.service.ts`)

#### Table Name Validation
```typescript
// Block creation of auth-related table names for security
const lowerTableName = tableName.toLowerCase();
if (lowerTableName === 'appuserauth' || lowerTableName === 'apprefreshtoken') {
  throw new Error(`Table name "${tableName}" is reserved for authentication purposes`);
}
```

#### Column Definition Validation
```typescript
// Block references to auth tables in column definitions
if (/\b(appuserauth|apprefreshtoken)\b/.test(body)) {
  throw new Error('Column definitions must not reference authentication tables (AppUserAuth, AppRefreshToken)');
}
```

#### Coverage
Prevents:
- Creating tables named `AppUserAuth` or `AppRefreshToken`
- Foreign key references to auth tables
- Column constraints referencing auth tables

---

### 4. Frontend UI Updates

#### Create Table Modal (`frontend/src/components/tables/CreateTableModal.tsx`)
Added guideline:
```tsx
<li className="flex items-start gap-2">
  <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
  Reserved table names: AppUserAuth, AppRefreshToken
</li>
<li className="flex items-start gap-2">
  <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
  Cannot reference system tables (Sys*) or auth tables in column definitions
</li>
```

#### SQL Query Step (`frontend/src/components/endpoints/SQLQueryStep.tsx`)
Updated blocked items message:
```tsx
<span className="font-medium">Blocked:</span> System tables (Sys*, AppUserAuth, AppRefreshToken), file operations, dangerous commands
```

---

## Complete Protection Matrix

| Operation | Sys* Tables | AppUserAuth | AppRefreshToken | pg_* Tables | information_schema |
|-----------|-------------|-------------|-----------------|-------------|-------------------|
| SQL Queries (Editor) | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| Endpoints (API Designer) | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| Functions (CREATE FUNCTION) | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| Table Creation (name) | ❌ Blocked | ❌ Blocked | ❌ Blocked | N/A | N/A |
| Column Definitions (FK, etc.) | ❌ Blocked | ❌ Blocked | ❌ Blocked | N/A | N/A |

---

## Example Blocked Queries

### SQL Editor / Endpoints
```sql
-- ❌ Direct selection
SELECT * FROM AppUserAuth;

-- ❌ With schema
SELECT * FROM public.AppRefreshToken;

-- ❌ JOIN operations
SELECT u.*, a.password 
FROM AppUser u 
JOIN AppUserAuth a ON u.id = a.appUserId;

-- ❌ Modifications
UPDATE AppUserAuth SET password = 'hacked';
DELETE FROM AppRefreshToken;

-- ❌ Case variations
select * from appuserauth;
SELECT * FROM "AppUserAuth";
```

### Functions
```sql
-- ❌ Function querying auth tables
CREATE FUNCTION get_user_password(user_id TEXT)
RETURNS TEXT AS $$
  SELECT password FROM AppUserAuth WHERE appUserId = user_id;
$$ LANGUAGE sql;

-- ❌ Function with JOIN
CREATE FUNCTION validate_token(token TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM AppRefreshToken 
    WHERE token = $1 AND revoked = false
  );
$$ LANGUAGE sql;
```

### Table Creation
```sql
-- ❌ Reserved table name
CREATE TABLE AppUserAuth (
  id TEXT PRIMARY KEY
);

-- ❌ Foreign key to auth table
CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY,
  auth_id TEXT REFERENCES AppUserAuth(id)
);
```

---

## Error Messages

### SQL Validator
- `"Direct access to authentication tables (AppUserAuth, AppRefreshToken) is not allowed for security reasons"`

### Function Validator
- `"Access to authentication tables (AppUserAuth, AppRefreshToken) is not allowed for security reasons. Functions cannot query, modify, or reference sensitive authentication tables."`
- `"Access to authentication table "{tableName}" is not allowed for security reasons"`

### Table Service
- `"Table name "{tableName}" is reserved for authentication purposes"`
- `"Column definitions must not reference authentication tables (AppUserAuth, AppRefreshToken)"`

---

## Testing Recommendations

### 1. SQL Query Tests
- [ ] Test direct SELECT from AppUserAuth
- [ ] Test direct SELECT from AppRefreshToken
- [ ] Test JOIN with auth tables
- [ ] Test INSERT/UPDATE/DELETE on auth tables
- [ ] Test case variations (lowercase, uppercase, mixed)
- [ ] Test schema-qualified references
- [ ] Test quoted identifiers

### 2. Function Creation Tests
- [ ] Test function querying AppUserAuth
- [ ] Test function modifying AppRefreshToken
- [ ] Test function with JOINs to auth tables
- [ ] Test case variations and quoted identifiers

### 3. Table Creation Tests
- [ ] Test creating table named AppUserAuth
- [ ] Test creating table named AppRefreshToken
- [ ] Test foreign key to auth tables
- [ ] Test column constraints referencing auth tables

### 4. Endpoint Tests
- [ ] Test endpoint with SQL accessing auth tables
- [ ] Test endpoint with parameterized queries to auth tables

---

## Files Modified

1. **Backend**
   - `backend/src/utils/sqlValidator.ts` - Added `hasAppAuthTableAccess()` function and validation check
   - `backend/src/utils/functionValidator.ts` - Added auth table pattern matching and validation
   - `backend/src/services/table.service.ts` - Added table name and column definition restrictions

2. **Frontend**
   - `frontend/src/components/tables/CreateTableModal.tsx` - Updated guidelines
   - `frontend/src/components/endpoints/SQLQueryStep.tsx` - Updated blocked items message

---

## Related Security Features

This enhancement complements existing security measures:
- System catalog blocking (pg_*, pg_catalog, information_schema)
- System table blocking (Sys* prefix)
- Dangerous command blocking (DROP, TRUNCATE, etc.)
- File operation blocking (COPY, pg_read_file, etc.)
- Role/user management blocking

---

## Status
✅ **Implemented and Ready for Testing**

**Date**: October 15, 2025  
**Impact**: Critical - Prevents unauthorized access to authentication data  
**Breaking Changes**: None (additive security only)
