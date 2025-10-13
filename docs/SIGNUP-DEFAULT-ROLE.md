# Signup & Default Role Feature Implementation

## Overview
Added support for enabling/disabling app-user signup and automatic role assignment via a configurable default role.

## Database Changes
**File**: `backend/prisma/schema.prisma`

Added two new fields to `SysProject`:
```prisma
signup_enabled Boolean @default(false)  // Controls if app users can self-register
default_role   String?                  // Role name to assign to new app users
```

**Migration Required**: Run these commands after pulling changes:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name add-signup-enabled-and-default-role
```

## Backend Changes

### 1. Project Creation (`backend/src/services/project.service.ts`)
- Accepts `signup_enabled` and `default_role` parameters
- Stores values in SysProject on project creation

### 2. Settings Update (`backend/src/services/settings.service.ts`)
- `updateRoles()` now accepts `signup_enabled` and `default_role`
- Updates persist alongside roles array and enable_roles flag

### 3. App User Signup (`backend/src/services/appAuth.service.ts`)
- On signup, fetches project settings
- If `project.signup_enabled` is true AND `project.default_role` is set:
  - Assigns `roles: [default_role]` to new AppUser
- Otherwise: no role assigned (roles undefined/empty)

### 4. Controllers & Validators
- **project.controller.ts**: Passes new fields through
- **settings.controller.ts**: Passes new fields through
- **project.validator.ts**: Validates `signup_enabled` (Boolean) and `default_role` (String, optional)

## Frontend Changes

### 1. Setup Project Page (`frontend/src/pages/SetupProject.tsx`)
**New UI Controls**:
- **"Enable app-user signup"** toggle (above role management toggle)
- **"Default role (optional)"** input inside role management section
  - Shows when role management is enabled
  - Autocomplete/datalist from defined roles
  - Help text explains role assignment behavior

**Validation**:
- Both fields optional
- Default role can be any string (validated against role names on backend)

### 2. Settings Page (`frontend/src/pages/Settings.tsx`)
**New UI Controls in Role Management Card**:
- **"Enable app-user signup"** toggle at top of card
  - Styled with background highlight
  - Shows descriptive help text
- **"Default role for new signups"** input
  - Shows below roles list, separated by divider
  - Has clear (X) button when value is set
  - Autocomplete from defined roles
  - Help text explains behavior

**Save Behavior**:
- "Save Changes" button updates: roles, enable_roles, signup_enabled, default_role
- Auto-save on role add/edit/delete also includes signup settings

### 3. Settings Service (`frontend/src/services/settings.ts`)
- `SettingsData` interface updated with `signup_enabled` and `default_role`
- `updateRoles()` accepts new fields

### 4. Project Service (`frontend/src/services/project.ts`)
- `createProject()` accepts `signup_enabled` and `default_role`

## User Flow

### Initial Setup
1. User creates project via Setup Project page
2. Toggles "Enable app-user signup" (optional)
3. Defines roles if desired
4. Selects default role from dropdown (optional)
5. Creates project → backend stores all settings

### Managing Settings
1. Owner navigates to Settings → Role Management
2. Sees current signup_enabled toggle state
3. Sees current default_role value
4. Can add/edit/delete roles
5. Can change signup toggle
6. Can change default role selection
7. Clicks "Save Changes" → backend updates project

### App User Signup (External API)
1. External user calls `POST /api/b/auth/signup` with email/password
2. Backend checks `project.signup_enabled` and `project.default_role`
3. If both are set: assigns `roles: [default_role]` to new user
4. If either is missing: no role assigned
5. Returns access token + user object

## Testing

### Manual Test Steps
1. **Create project with signup disabled**:
   - Go to /setup
   - Leave "Enable app-user signup" OFF
   - Create project
   - Verify Settings shows signup disabled

2. **Enable signup and set default role**:
   - Go to Settings → Role Management
   - Toggle "Enable app-user signup" ON
   - Add role named "user"
   - Set default role to "user"
   - Save
   - Verify settings persist after reload

3. **Test app-user signup**:
   ```bash
   curl -X POST http://localhost:3000/api/b/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Password1"}'
   ```
   - Check response includes user.roles = ["user"]

4. **Test without default role**:
   - Clear default role in Settings
   - Save
   - Sign up new user
   - Verify user.roles is undefined or empty

5. **Test with signup disabled**:
   - Disable "Enable app-user signup"
   - Save
   - Sign up new user
   - Verify no role is assigned (even if default_role is set)

### Edge Cases Covered
- ✅ Default role input accepts freeform text (not restricted to existing roles)
- ✅ Empty/null default_role handled correctly
- ✅ Signup disabled overrides default_role assignment
- ✅ Autosave on role changes preserves signup settings
- ✅ Non-owner users see controls but cannot edit
- ✅ Settings persist across page reloads

## API Changes

### Request Bodies
**POST /api/project** (create):
```json
{
  "name": "My Project",
  "enable_roles": true,
  "roles": [{"name": "user", "description": "..."}],
  "signup_enabled": true,
  "default_role": "user"
}
```

**PUT /api/settings/roles** (update):
```json
{
  "roles": [...],
  "enable_roles": true,
  "signup_enabled": true,
  "default_role": "user"
}
```

### Response Schema
**GET /api/settings**:
```json
{
  "project": {
    ...
    "signup_enabled": true,
    "default_role": "user"
  },
  "user": {...},
  "isOwner": true
}
```

## Notes
- Default role is stored as a plain string (role name), not a reference/ID
- Validation of default_role against actual roles happens on the backend
- Frontend allows any string but provides autocomplete from existing roles
- signup_enabled defaults to false for new projects
- The feature is owner-only (regular users see but cannot modify)
