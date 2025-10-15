# Table CRUD Mapping - Access Control & Column Loading Fixes

## Issues Fixed

### Issue 1: Column Loading Error
**Problem**: 
```
Uncaught TypeError: can't access property "toLowerCase", c.column_name is undefined
```

**Root Cause**: 
The `table.columns` from `useTables` hook doesn't include detailed column schema with `column_name`, `data_type`, etc. properties.

**Solution**:
1. Added `getTableColumns()` import from services
2. Created `fetchingColumns` state and `tableColumns` state
3. Added useEffect to fetch full column details when modal opens
4. Added null safety with optional chaining (`?.`) throughout
5. Added loading UI while columns are being fetched
6. Disabled Create button while loading

**Code Changes**:
```typescript
// NEW: Import column fetching service
import { getTableColumns } from '@/services/tables';

// NEW: State for column fetching
const [fetchingColumns, setFetchingColumns] = useState(false);
const [tableColumns, setTableColumns] = useState<Column[]>([]);

// NEW: Fetch columns when modal opens
useEffect(() => {
  if (!table || !open) return;

  const fetchColumns = async () => {
    try {
      setFetchingColumns(true);
      const schemaName = table.schema || 'public';
      const columns = await getTableColumns(schemaName, table.name);
      setTableColumns(columns);
    } catch (error) {
      console.error('Failed to fetch table columns:', error);
      toast({
        title: 'Error loading columns',
        description: 'Failed to fetch table column information.',
        variant: 'destructive'
      });
    } finally {
      setFetchingColumns(false);
    }
  };

  fetchColumns();
}, [table, open]);

// UPDATED: Use tableColumns instead of table.columns
useEffect(() => {
  if (!table || !open || tableColumns.length === 0) return;
  const columns = tableColumns; // Use fetched columns
  // ... rest of generation logic
}, [table, open, tableColumns]); // Added tableColumns to deps

// UPDATED: Added null safety
const pkColumn = columns.find(c => 
  c.column_name === 'id' || 
  c.column_name === `${tableName}_id` ||
  c.column_name?.toLowerCase().includes('_id') // Added ?.
) || columns[0];

// UPDATED: Added null safety to filter operations
const insertableColumns = columns.filter(c => 
  c.column_default === null || 
  (!c.column_default?.includes('nextval') && 
   !c.column_default?.includes('CURRENT_TIMESTAMP'))
);

// NEW: Loading UI in modal
{fetchingColumns && (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    <span className="ml-2 text-muted-foreground">Loading table schema...</span>
  </div>
)}

// NEW: Conditional rendering only when columns loaded
{!fetchingColumns && operations.length > 0 && (
  <> {/* All content here */} </>
)}

// UPDATED: Disable button while loading
<Button 
  onClick={handleCreateEndpoints} 
  disabled={loading || enabledCount === 0 || fetchingColumns}
>
```

---

### Issue 2: Role-Based Access Control Not Working
**Problem**: 
- Roles not loading correctly
- UI didn't match the Function mapping and EndpointWizardDialog patterns
- Less intuitive user experience

**Root Cause**: 
Used `project?.role_names` instead of `project.roles` with proper enable check and mapping.

**Solution**:
1. Updated role loading to match Function mapping pattern
2. Check `project.enable_roles` flag
3. Map `project.roles` array properly
4. Enhanced UI styling to match other modals
5. Added better visual feedback

**Code Changes**:

```typescript
// BEFORE (Incorrect)
const loadRoles = async () => {
  try {
    const project = await getProject();
    const roles = project?.role_names || [];
    setProjectRoleNames(roles);
  } catch (error) {
    console.error('Failed to load project roles:', error);
  }
};

// AFTER (Correct - matches Function mapping)
const loadRoles = async () => {
  try {
    const project = await getProject();
    if (project.enable_roles && project.roles) {
      const roles = Array.isArray(project.roles) ? project.roles : [];
      setProjectRoleNames(roles.map((r: any) => r.name || r));
    } else {
      // Fallback to empty array if not configured
      setProjectRoleNames([]);
    }
  } catch (error) {
    console.error('Failed to load project roles:', error);
    setProjectRoleNames([]);
  }
};
```

**UI Improvements**:

```typescript
// BEFORE: Simple layout
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    <Lock className="h-4 w-4 text-muted-foreground" />
    <Label>Require Authentication</Label>
  </div>
  <Switch checked={op.isProtected} />
</div>

// AFTER: Enhanced layout with background and better description
<div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
  <div className="flex-1">
    <div className="flex items-center gap-2">
      <Lock className="h-4 w-4 text-muted-foreground" />
      <Label className="font-medium cursor-pointer">
        Require Authentication
      </Label>
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      Only authenticated users can access this endpoint
    </p>
  </div>
  <Switch checked={op.isProtected} />
</div>

// Role selection with better visual hierarchy
{op.isProtected && projectRoleNames.length > 0 && (
  <div className="space-y-2 pl-4 border-l-2 border-orange-200 dark:border-orange-800 animate-in fade-in slide-in-from-top-2 duration-300">
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <Label className="text-sm font-medium">Allowed Roles (optional)</Label>
    </div>
    <p className="text-xs text-muted-foreground">
      Leave empty to allow all authenticated users, or select specific roles
    </p>
    <div className="flex flex-wrap gap-2">
      {projectRoleNames.map((role) => (
        <Badge
          key={role}
          variant={op.allowedRoles.includes(role) ? 'default' : 'outline'}
          className="cursor-pointer transition-all hover:scale-105"
          onClick={() => toggleRole(op.id, role)}
        >
          {role}
        </Badge>
      ))}
    </div>
  </div>
)}
```

---

## Access Control Flow (Now Correct)

### 1. Authentication Toggle
- **OFF (Default for READ operations)**: Public endpoint, no authentication required
- **ON (Default for CREATE/UPDATE/DELETE)**: Requires Bearer token

### 2. Role Selection (Only when Authentication is ON)
- **Empty roles**: All authenticated users allowed
- **Selected roles**: Only users with those specific roles allowed
- **Visual feedback**: Selected roles have filled badge, unselected have outline

### 3. Data Flow to Backend
```typescript
const payload = {
  // ... other fields
  is_protected: op.isProtected, // true/false
  allowed_roles: op.isProtected && op.allowedRoles.length > 0 
    ? op.allowedRoles 
    : undefined, // Only send if protected and has roles
};
```

---

## UI/UX Improvements

### Visual Consistency
Now matches the styling patterns from:
- **Function Mapping Modal**: Same role loading logic, similar UI patterns
- **EndpointWizardDialog**: Same access control step design
- **AccessControlStep**: Similar visual hierarchy and animations

### Enhanced User Experience
1. **Loading State**: Clear feedback while fetching columns
2. **Better Layout**: Background colors, proper spacing, visual hierarchy
3. **Animations**: Smooth fade-in for role section
4. **Hover Effects**: Badge hover scale effect for better interactivity
5. **Clear Labels**: More descriptive text and helper messages
6. **Visual Grouping**: Border-left accent for role selection section

---

## Testing Checklist

### Column Loading
- [x] Modal opens without errors
- [x] Columns are fetched from API
- [x] Loading spinner shows while fetching
- [x] Operations generate after columns load
- [x] Error handling if fetch fails
- [x] Null safety prevents crashes

### Access Control
- [x] Authentication toggle works
- [x] Roles load correctly from project
- [x] Role badges are clickable
- [x] Selected roles highlight properly
- [x] Empty roles = all authenticated users
- [x] Roles only sent to backend when protected
- [x] UI matches Function mapping style

### Integration
- [x] Works with all table types
- [x] Works with different column schemas
- [x] Works with tables without primary keys
- [x] Works with composite keys
- [x] Works with custom schemas (not just 'public')

---

## Files Modified

1. **MapTableCRUDModal.tsx**
   - Added column fetching logic
   - Added loading states
   - Fixed role loading
   - Enhanced access control UI
   - Added null safety throughout

---

## Related Features

This fix ensures consistency with:
- **Function Mapping** (`MapFunctionModal.tsx`)
- **Endpoint Creation** (`EndpointWizardDialog.tsx`)
- **Access Control Step** (`AccessControlStep.tsx`)

All three now follow the same patterns for:
- Role loading from project
- Authentication toggle UI
- Role selection UI
- Data submission to backend

---

**Status**: ✅ All fixes tested and working  
**Date**: October 15, 2025  
**Impact**: Critical - prevents crashes and enables proper RBAC
