# Signup & Default Role - Complete Integration Flow

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐          ┌──────────────────┐            │
│  │  SetupProject    │          │    Settings      │            │
│  │  (Create)        │          │    (Edit)        │            │
│  ├──────────────────┤          ├──────────────────┤            │
│  │ ☑️ Enable Signup│          │ ☑️ Enable Signup│            │
│  │ 📝 Default Role  │          │ 📝 Default Role  │            │
│  │ 💾 Create        │          │ 💾 Save (auto)   │            │
│  └──────┬───────────┘          └──────┬───────────┘            │
│         │                              │                         │
└─────────┼──────────────────────────────┼─────────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND SERVICES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  project.ts:                    settings.ts:                     │
│  createProject()                updateRoles()                    │
│  └─> POST /api/project          └─> PUT /api/settings/roles     │
│      {                              {                            │
│        name: "...",                   roles: [...],              │
│        signup_enabled: true,          enable_roles: true,        │
│        default_role: "user"           signup_enabled: true,      │
│      }                                default_role: "user"       │
│                                     }                            │
└─────────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND CONTROLLERS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  project.controller.ts          settings.controller.ts           │
│  createProject()                updateRoles()                    │
│  └─> Validates & passes to      └─> Validates & passes to       │
│      project.service                 settings.service            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND SERVICES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  project.service.ts             settings.service.ts              │
│  createProject()                updateRoles()                    │
│  └─> prisma.sysProject.create   └─> prisma.sysProject.update    │
│      {                              {                            │
│        signup_enabled: true,          signup_enabled: true,      │
│        default_role: "user"           default_role: "user"       │
│      }                              }                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DATABASE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  SysProject Table                                                │
│  ┌─────────────────────────────────────────────┐                │
│  │ id                  │ String                │                │
│  │ name                │ String                │                │
│  │ enable_roles        │ Boolean               │                │
│  │ roles               │ Json                  │                │
│  │ signup_enabled      │ Boolean (@default: false)             │
│  │ default_role        │ String? (nullable)    │                │
│  │ ...                 │ ...                   │                │
│  └─────────────────────────────────────────────┘                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📥 App User Signup Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      APP USER SIGNUP                             │
└─────────────────────────────────────────────────────────────────┘
          │
          │ POST /api/b/auth/signup
          │ {
          │   firstName: "John",
          │   lastName: "Doe",
          │   email: "john@example.com",
          │   password: "Password1"
          │ }
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│              appAuth.service.ts - signup()                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Fetch project settings                                       │
│     const project = await prisma.sysProject.findFirst()          │
│                                                                   │
│  2. Check signup rules                                           │
│     const defaultRole = project?.default_role || null            │
│     const assignDefault = !!defaultRole && project?.signup_enabled│
│                                                                   │
│  3. Create user with conditional role                            │
│     await prisma.appUser.create({                                │
│       data: {                                                    │
│         firstName,                                               │
│         lastName,                                                │
│         email,                                                   │
│         roles: assignDefault ? [defaultRole] : undefined,  ◄──┐ │
│         auth: { create: { password: hashed } }                │ │
│       }                                                         │ │
│     })                                                          │ │
│                                                                 │ │
└─────────────────────────────────────────────────────────────────┘ │
                                                                    │
┌───────────────────────────────────────────────────────────────────┘
│
│  ROLE ASSIGNMENT LOGIC:
│  ─────────────────────
│
│  ✅ Signup Enabled + Default Role Set
│     → roles: ["user"]
│
│  ❌ Signup Disabled + Default Role Set
│     → roles: [] (no role)
│
│  ❌ Signup Enabled + No Default Role
│     → roles: [] (no role)
│
│  ❌ Signup Disabled + No Default Role
│     → roles: [] (no role)
│
└─────────────────────────────────────────────────────────────────
```

## 🎯 Decision Matrix

| signup_enabled | default_role | Result                        |
|----------------|--------------|-------------------------------|
| ✅ true        | ✅ "user"    | ✅ Assign role: ["user"]     |
| ✅ true        | ❌ null      | ❌ No role assigned: []       |
| ❌ false       | ✅ "user"    | ❌ No role assigned: []       |
| ❌ false       | ❌ null      | ❌ No role assigned: []       |

## 🔍 Code References

### Backend Files Modified
```
backend/
  prisma/
    schema.prisma                     ← Added signup_enabled, default_role
  src/
    validators/
      project.validator.ts            ← Extended validation schema
    services/
      project.service.ts              ← createProject handles new fields
      settings.service.ts             ← updateRoles handles new fields
      appAuth.service.ts              ← signup checks & assigns role
    controllers/
      project.controller.ts           ← Passes through new fields
      settings.controller.ts          ← Passes through new fields
```

### Frontend Files Modified
```
frontend/
  src/
    pages/
      SetupProject.tsx                ← Initial setup with signup controls
      Settings.tsx                    ← Role Management card with signup controls
    services/
      project.ts                      ← Extended createProject signature
      settings.ts                     ← Extended SettingsData interface & updateRoles
```

## 📊 Testing Matrix

| Test Case | Expected Behavior |
|-----------|-------------------|
| Create project with signup enabled | ✓ Settings saved |
| Create project with default role | ✓ Role stored |
| Signup when both enabled | ✓ User gets role |
| Signup when signup disabled | ✓ User gets no role |
| Signup when no default role | ✓ User gets no role |
| Update settings via Settings page | ✓ Changes persisted |
| Autosave when editing roles | ✓ Signup settings preserved |

## 🎨 UI Components

### SetupProject Page
```
┌────────────────────────────────────────────┐
│ 📝 Project Setup                           │
├────────────────────────────────────────────┤
│                                            │
│ Name: [_____________________________]     │
│                                            │
│ ☑️ Enable Roles                           │
│                                            │
│ Roles:                                     │
│   • admin - Administrator                  │
│   • user - Regular user                    │
│                                            │
│ ☑️ Enable Signup                          │
│                                            │
│ Default Role: [user ▼]                     │
│                                            │
│ [Create Project]                           │
│                                            │
└────────────────────────────────────────────┘
```

### Settings Page - Role Management
```
┌────────────────────────────────────────────┐
│ 🔐 Role Management                         │
├────────────────────────────────────────────┤
│                                            │
│ 🟢 Allow user signups                      │
│ ☑️ Enable Signup                          │
│                                            │
│ ─────────────────────────────────────────  │
│                                            │
│ Enable Roles: ☑️                          │
│                                            │
│ Roles:                                     │
│   • admin - Administrator    [Edit] [×]    │
│   • user - Regular user      [Edit] [×]    │
│                                            │
│ [+ Add Role]                               │
│                                            │
│ ─────────────────────────────────────────  │
│                                            │
│ Default Role for New Signups              │
│ [user ▼]                     [Clear]       │
│                                            │
│ [💾 Save Role Configuration]              │
│                                            │
└────────────────────────────────────────────┘
```

## 🚀 Quick Start Commands

```bash
# 1. Generate Prisma client & migrate
cd backend
npx prisma generate
npx prisma migrate dev --name add-signup-enabled-and-default-role

# 2. Start backend
npm run dev

# 3. Run tests (in another terminal)
cd backend
./test-signup-role.sh

# 4. Manual test with curl
curl -X POST http://localhost:3000/api/b/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"Password1"}'
```

## 📝 Notes

- **Type Safety**: All TypeScript types properly defined after `npx prisma generate`
- **Validation**: Backend validates all inputs through Joi schemas
- **Security**: Passwords hashed with bcrypt, JWTs for authentication
- **Persistence**: All settings stored in SysProject table
- **User Experience**: Autosave prevents data loss when editing roles
- **Flexibility**: Signup can be toggled without affecting existing users
- **Scalability**: Role system supports multiple roles per user
