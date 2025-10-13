# Next Steps - Signup & Default Role Feature

## ✅ Completed
- [x] Backend schema updated with `signup_enabled` and `default_role` fields
- [x] Backend services/controllers/validators handle new fields
- [x] App-user signup respects `signup_enabled` and auto-assigns `default_role`
- [x] SetupProject page UI complete with signup toggle and default role input
- [x] Settings page UI restructured with proper layout and controls
- [x] Frontend services properly typed
- [x] Autosave and explicit save include all fields
- [x] Documentation created (see `docs/SIGNUP-DEFAULT-ROLE.md`)
- [x] TypeScript compilation clean
- [x] Test script created

## 🔄 Required Actions (Do These Now)

### 1. Regenerate Prisma Client & Migrate Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name add-signup-enabled-and-default-role
```

**What this does:**
- `npx prisma generate` - Regenerates Prisma client with new fields
- `npx prisma migrate dev` - Creates and applies database migration

### 2. Restart Backend Server

```bash
# In backend directory
npm run dev
```

### 3. Run Integration Tests

```bash
# In backend directory
./test-signup-role.sh
```

**This test script verifies:**
- ✓ Project creation with signup settings
- ✓ App user signup with default role assignment
- ✓ Role not assigned when signup disabled
- ✓ Role not assigned when default_role is empty
- ✓ Settings updates work correctly

## 📋 Manual Testing Checklist

### Setup Project Page
- [ ] Create new project with signup enabled and default role
- [ ] Create project with signup disabled
- [ ] Create project without default role set
- [ ] Verify role autocomplete works

### Settings Page
- [ ] Toggle signup enabled/disabled
- [ ] Change default role
- [ ] Clear default role
- [ ] Verify autosave works when editing roles
- [ ] Verify explicit save button works
- [ ] Check as non-owner user (should see but not edit)

### App User Signup
- [ ] Sign up when signup enabled + default role set → should get role
- [ ] Sign up when signup enabled + no default role → should get no role
- [ ] Sign up when signup disabled + default role set → should get no role

### Example Curl Commands

```bash
# 1. Create project with signup enabled
curl -X POST http://localhost:3000/api/project \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My App",
    "enable_roles": true,
    "roles": [{"name": "user", "description": "Regular user"}],
    "signup_enabled": true,
    "default_role": "user"
  }'

# 2. Sign up app user
curl -X POST http://localhost:3000/api/b/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password1"
  }'

# 3. Update settings
curl -X PUT http://localhost:3000/api/settings/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "roles": [{"name": "user", "description": "Regular user"}],
    "enable_roles": true,
    "signup_enabled": false,
    "default_role": null
  }'
```

## 🐛 Known Limitations & Future Enhancements

### Current Behavior
- Default role is stored as string (role name), not validated against defined roles
- Frontend allows freeform text input for default role
- No blocking at API level when signup disabled (role just not assigned)

### Possible Improvements
1. **Validation**: Ensure `default_role` matches one of the defined role names
2. **API Blocking**: Return 403 from `/api/b/auth/signup` when `signup_enabled` is false
3. **Better UX**: Add "Make default" radio button next to each role instead of text input
4. **Automated Tests**: Add Jest/Mocha tests for signup behavior
5. **Audit Log**: Track when signup settings are changed

## 📚 Reference Documents
- **Feature Documentation**: `docs/SIGNUP-DEFAULT-ROLE.md`
- **Auth Refactor**: `docs/AUTH-REFACTOR.md`
- **Test Script**: `backend/test-signup-role.sh`

## 🚨 Important Notes

1. **Prisma Generate Required**: The backend won't recognize new fields until you run `npx prisma generate`
2. **Migration Required**: Database schema must be migrated before testing
3. **Server Restart Required**: Backend must be restarted after Prisma generation
4. **Type Safety**: Frontend uses proper TypeScript types - no `any` casting needed after migration
5. **Autosave**: Settings page autosaves when you edit roles - signup settings are preserved

## ✨ Feature Summary

**What's New:**
- Project owners can toggle signup on/off for app users
- Project owners can set a default role that's auto-assigned on signup
- Settings page shows current signup configuration
- Setup project page allows initial configuration
- Autosave preserves signup settings when editing roles

**How It Works:**
- When `signup_enabled: true` AND `default_role` is set → New users get that role
- When `signup_enabled: false` OR `default_role` is empty → No role assigned
- Role assignment happens during signup in `appAuth.service.ts`
- Settings stored in `SysProject` table (not per-user)
