# Table CRUD API Mapping Feature

## Overview
The Table CRUD API Mapping feature allows builders to automatically generate complete REST API endpoints for database tables with full CRUD (Create, Read, Update, Delete) operations. Unlike the Function Mapping feature which creates a single endpoint, this feature generates up to 5 endpoints for comprehensive table management.

## Feature Location
- **Page**: Tables (`/tables`)
- **Trigger**: "Map to API" button on each table card
- **Component**: `MapTableCRUDModal.tsx`

## User Experience Flow

### 1. Opening the Modal
When a builder clicks "Map to API" on a table card:
1. Modal opens with the table name in the title
2. System automatically analyzes table schema (columns, data types, primary key)
3. Generates 5 pre-configured CRUD operations with smart defaults
4. All operations are enabled by default (builder can disable unwanted ones)

### 2. Base Path Configuration
```
Default: /api/{tablename}
Example: /api/users
```
- Single input field controls base path for all operations
- Changing base path updates all endpoint paths automatically
- Operations with path parameters append `/{id}` automatically

### 3. CRUD Operations Generated

#### **CREATE** (POST)
- **Method**: POST
- **Path**: `/api/{tablename}`
- **SQL**: Auto-generates INSERT statement with all insertable columns
- **Parameters**: Body parameters for all non-auto-generated columns
- **Default Protection**: ✅ Protected (requires authentication)
- **Example**:
  ```sql
  INSERT INTO public.users (name, email, role)
  VALUES ({name}, {email}, {role})
  RETURNING *;
  ```

#### **READ ALL** (GET)
- **Method**: GET
- **Path**: `/api/{tablename}`
- **SQL**: SELECT with pagination support
- **Parameters**: 
  - `limit` (query, number, optional) - default 50
  - `offset` (query, number, optional) - default 0
- **Default Protection**: ❌ Not protected
- **Example**:
  ```sql
  SELECT * FROM public.users
  ORDER BY id DESC
  LIMIT COALESCE({limit}, 50)
  OFFSET COALESCE({offset}, 0);
  ```

#### **READ ONE** (GET)
- **Method**: GET
- **Path**: `/api/{tablename}/{id}`
- **SQL**: SELECT single record by primary key
- **Parameters**: 
  - `{id}` (path, number/string, required) - primary key
- **Default Protection**: ❌ Not protected
- **Example**:
  ```sql
  SELECT * FROM public.users
  WHERE id = {id}
  LIMIT 1;
  ```

#### **UPDATE** (PUT)
- **Method**: PUT
- **Path**: `/api/{tablename}/{id}`
- **SQL**: UPDATE statement with SET clause for all updateable columns
- **Parameters**:
  - `{id}` (path, number/string, required) - primary key
  - Body parameters for all updateable columns (excluding PK and auto-generated)
- **Default Protection**: ✅ Protected (requires authentication)
- **Example**:
  ```sql
  UPDATE public.users
  SET name = {name},
      email = {email},
      role = {role}
  WHERE id = {id}
  RETURNING *;
  ```

#### **DELETE** (DELETE)
- **Method**: DELETE
- **Path**: `/api/{tablename}/{id}`
- **SQL**: DELETE statement by primary key
- **Parameters**:
  - `{id}` (path, number/string, required) - primary key
- **Default Protection**: ✅ Protected (requires authentication)
- **Example**:
  ```sql
  DELETE FROM public.users
  WHERE id = {id}
  RETURNING *;
  ```

## Smart Defaults

### Primary Key Detection
The system detects primary keys using these patterns (in order):
1. Column named `id`
2. Column named `{tablename}_id`
3. Any column containing `_id`
4. First column (fallback)

### Column Filtering

**Insertable Columns** (CREATE):
- Excludes auto-generated columns (SERIAL, sequences)
- Excludes columns with `CURRENT_TIMESTAMP` defaults
- Includes all user-settable columns

**Updateable Columns** (UPDATE):
- Same as insertable columns
- Additionally excludes the primary key column

### PostgreSQL to API Type Mapping
```typescript
PostgreSQL Type → API Type
---------------------------
integer, bigint, serial → number
numeric, decimal, float, double → number
boolean → boolean
text, varchar, char → string
json, jsonb → string (parsed as JSON)
array, uuid, date, timestamp → string
```

### Access Control Defaults
- **CREATE**: Protected (requires auth)
- **READ ALL**: Not protected (public)
- **READ ONE**: Not protected (public)
- **UPDATE**: Protected (requires auth)
- **DELETE**: Protected (requires auth)

Rationale: Read operations are public by default for easier API consumption, while write operations require authentication for security.

## Builder Configuration Options

### Per-Operation Configuration
Each CRUD operation can be individually configured:

1. **Enable/Disable**: Checkbox to include/exclude from creation
2. **Description**: Custom endpoint description
3. **SQL Query**: Full SQL editor with syntax highlighting
4. **Parameters**: Auto-detected, displayed with badges (path/query/body)
5. **Access Control**:
   - **Require Authentication**: Toggle switch
   - **Allowed Roles**: Multi-select role badges (only if protected)

### Visual Indicators

**Method Badges**:
- GET: Blue (default)
- POST: Gray (secondary)
- PUT: Gray outline
- DELETE: Red (destructive)

**Parameter Badges**:
- Path parameters: Blue badge with `(path)` label
- Query parameters: Gray badge with `(query)` label
- Body parameters: Gray badge with `(body)` label
- Required parameters: Marked with `*` asterisk

**Creation Status**:
- Pending: Spinner icon + "Creating..." badge
- Success: Green checkmark + "Created" badge
- Error: Red X + "Failed" badge

## Batch Creation Process

### Sequential Creation
Endpoints are created one at a time to provide real-time progress feedback:

```typescript
1. Filter enabled operations
2. For each operation:
   a. Set status to "pending"
   b. Call createEndpoint API
   c. Update status to "success" or "error"
   d. Display visual feedback
3. Show summary toast notification
```

### Result Handling

**Full Success**:
```
✅ "CRUD endpoints created"
   "Successfully created 5 API endpoints."
```

**Partial Success**:
```
⚠️ "Partially completed"
   "Created 3 endpoints, 2 failed."
```

**Full Failure**:
```
❌ "Failed to create endpoints"
   "All endpoint creation requests failed."
```

## Technical Implementation

### Component Structure
```
MapTableCRUDModal.tsx (600+ lines)
├── State Management
│   ├── operations[] - Array of 5 CRUD operations
│   ├── projectRoleNames[] - Available roles from project
│   ├── basePath - Shared base path
│   └── creatingStatus{} - Per-operation creation status
├── Auto-Generation Logic
│   ├── useEffect: Analyze table schema → generate operations
│   ├── useEffect: Load project roles for access control
│   └── mapColumnType(): PostgreSQL → API type conversion
├── User Interactions
│   ├── toggleOperation() - Enable/disable operation
│   ├── toggleProtection() - Toggle authentication
│   ├── toggleRole() - Multi-select role management
│   ├── updateOperation() - Edit description/SQL
│   └── handleBasePathChange() - Update all paths
└── Batch Creation
    └── handleCreateEndpoints() - Sequential API calls
```

### Data Flow
```
1. Table data (schema, columns) → Modal props
2. Schema analysis → Generate 5 CRUD operations
3. Builder customization → Update operations state
4. Create button click → Sequential endpoint creation
5. Success callback → Refresh parent (optional)
```

### Integration Points

**Tables.tsx**:
```typescript
const [mapAPIModalOpen, setMapAPIModalOpen] = useState(false);

const handleMapAPI = (table: TableData) => {
  setSelectedTable(table);
  setMapAPIModalOpen(true);
};

<MapTableCRUDModal
  open={mapAPIModalOpen}
  onOpenChange={setMapAPIModalOpen}
  table={selectedTable}
  onSuccess={handleEndpointsCreated}
/>
```

**TableCard.tsx**:
```typescript
<Button onClick={onMapAPI}>
  <Map className="h-4 w-4 mr-1" />
  Map to API
</Button>
```

### Backend Integration
Uses existing endpoint service:
```typescript
import { createEndpoint, type CreateEndpointInput } from '@/services/endpoints';

const payload: CreateEndpointInput = {
  method: op.method,
  path: op.path,
  description: op.description,
  sql: op.sql,
  params: op.params,
  is_protected: op.isProtected,
  allowed_roles: op.isProtected && op.allowedRoles.length > 0 
    ? op.allowedRoles 
    : undefined,
  is_active: true
};

await createEndpoint(payload);
```

## Usage Examples

### Example 1: Public Read-Only API
**Scenario**: Blog posts table, public reading, admin-only editing

**Configuration**:
- ✅ CREATE - Protected, Role: ["admin"]
- ✅ READ ALL - Not protected
- ✅ READ ONE - Not protected
- ✅ UPDATE - Protected, Role: ["admin"]
- ✅ DELETE - Protected, Role: ["admin"]

**Result**: 5 endpoints created
- `GET /api/posts` - Public
- `GET /api/posts/{id}` - Public
- `POST /api/posts` - Admin only
- `PUT /api/posts/{id}` - Admin only
- `DELETE /api/posts/{id}` - Admin only

### Example 2: Internal Admin API
**Scenario**: User management table, all operations protected

**Configuration**:
- ✅ CREATE - Protected, Role: ["admin"]
- ✅ READ ALL - Protected, Role: ["admin", "moderator"]
- ✅ READ ONE - Protected, Role: ["admin", "moderator"]
- ✅ UPDATE - Protected, Role: ["admin"]
- ✅ DELETE - Protected, Role: ["admin"]

**Result**: 5 endpoints created, all protected

### Example 3: Simple CRUD (No Delete)
**Scenario**: Product catalog, no deletion allowed

**Configuration**:
- ✅ CREATE - Protected, Role: ["editor"]
- ✅ READ ALL - Not protected
- ✅ READ ONE - Not protected
- ✅ UPDATE - Protected, Role: ["editor"]
- ❌ DELETE - Disabled

**Result**: 4 endpoints created (no DELETE endpoint)

### Example 4: Custom Base Path
**Scenario**: API versioning

**Configuration**:
- Base Path: `/api/v2/products`
- All operations enabled

**Result**:
- `POST /api/v2/products`
- `GET /api/v2/products`
- `GET /api/v2/products/{id}`
- `PUT /api/v2/products/{id}`
- `DELETE /api/v2/products/{id}`

## Advanced Features

### 1. SQL Customization
Builders can edit the auto-generated SQL:
- Add WHERE clauses for soft deletes
- Add JOINs for related data
- Add computed columns
- Add business logic filters

**Example**: Soft Delete
```sql
-- Original
DELETE FROM public.users WHERE id = {id} RETURNING *;

-- Customized
UPDATE public.users 
SET deleted_at = CURRENT_TIMESTAMP 
WHERE id = {id} AND deleted_at IS NULL 
RETURNING *;
```

### 2. Role-Based Access
- Fetch roles from project settings dynamically
- Multi-select UI with badge toggles
- Empty = all authenticated users allowed
- Selected roles = only those roles allowed

### 3. Parameter Preview
- Shows all detected parameters with type and location
- Color-coded badges for visual clarity
- Required parameters marked with asterisk
- Helps builders understand the API contract

### 4. Real-Time Validation
- Path parameter detection from `{paramName}` syntax
- PostgreSQL type to API type conversion
- Column nullability → parameter requirement mapping
- Primary key detection and usage

## Edge Cases Handled

### 1. Tables Without Primary Key
- Uses first column as identifier
- Builder should customize SQL if needed

### 2. Composite Primary Keys
- System uses first column of composite key
- Builder must customize SQL for proper WHERE clause

### 3. Auto-Generated Columns
- Automatically excluded from INSERT and UPDATE
- Detected by: `nextval()`, `CURRENT_TIMESTAMP`, `SERIAL`

### 4. Complex Data Types
- JSON/JSONB → string type (frontend parses)
- Arrays → string type (frontend parses)
- Custom types → string type (safe default)

### 5. Reserved SQL Keywords
- Column names used as-is (PostgreSQL handles escaping)
- Builder can wrap in quotes if needed: `"order"`

### 6. Schema Names
- Fully qualified table names: `schema.table`
- Default schema: `public` if not specified

## Best Practices

### For Builders
1. **Review Generated SQL**: Always check auto-generated queries
2. **Test Endpoints**: Use API Designer to test before deploying
3. **Start Permissive**: Begin with public read, protected write
4. **Document APIs**: Use clear, descriptive endpoint descriptions
5. **Version Paths**: Use `/api/v1/resource` for future-proofing

### For Security
1. **Protect Writes**: Always require auth for CREATE/UPDATE/DELETE
2. **Use Roles**: Leverage role-based access for granular control
3. **Validate Input**: Add SQL constraints for data validation
4. **Audit Trails**: Modify SQL to include user tracking
5. **Rate Limiting**: Configure at API gateway level

### For Performance
1. **Add Indexes**: Ensure primary key and frequently queried columns indexed
2. **Limit Results**: Keep default LIMIT reasonable (50 is good)
3. **Use Pagination**: Offset-based pagination for large datasets
4. **Optimize Queries**: Add indexes for JOIN operations

## Comparison: Functions vs Tables

| Aspect | Function Mapping | Table CRUD Mapping |
|--------|------------------|-------------------|
| **Endpoints Created** | 1 endpoint | Up to 5 endpoints |
| **SQL Source** | Function definition | Auto-generated from schema |
| **Parameter Detection** | Parse function signature | Analyze table columns |
| **Use Case** | Complex business logic | Standard CRUD operations |
| **Customization** | Path, method, SQL can change | SQL editable, operations configurable |
| **Batch Creation** | Single create | Sequential batch create |
| **Status Feedback** | Single success/error | Per-operation status |
| **Access Control** | Per-endpoint | Per-operation |

## Future Enhancements

### Planned Features
1. **Search Endpoints**: Auto-generate `/api/users/search?q={query}`
2. **Bulk Operations**: `POST /api/users/bulk` for batch inserts
3. **Relationships**: Auto-detect foreign keys, generate JOIN endpoints
4. **Soft Delete Support**: Toggle for soft delete behavior
5. **Audit Logging**: Auto-add `created_by`, `updated_by` tracking
6. **Custom Templates**: Save and reuse endpoint configurations
7. **OpenAPI Export**: Generate OpenAPI/Swagger spec from endpoints

### Potential Improvements
1. Real-time SQL validation before creation
2. Preview actual API response format
3. Test endpoint directly in modal
4. Import/export endpoint configurations
5. Duplicate detection (prevent creating same path twice)

## Troubleshooting

### Issue: "Failed to create endpoints"
**Cause**: Backend validation error or database permissions
**Solution**: 
1. Check table exists and is accessible
2. Verify SQL syntax in generated queries
3. Check backend logs for specific error
4. Ensure project has active database connection

### Issue: Wrong primary key detected
**Cause**: Unconventional naming or composite keys
**Solution**:
1. Disable auto-generated operations
2. Create custom endpoints in API Designer
3. Or customize SQL to use correct key column

### Issue: Parameters not detected
**Cause**: SQL uses non-standard parameter syntax
**Solution**:
1. Ensure parameters use `{paramName}` format
2. Edit operation to add parameters manually
3. Verify parameter names match column names

### Issue: Role selection not working
**Cause**: Project roles not loaded
**Solution**:
1. Ensure project settings has defined roles
2. Refresh page and try again
3. Check browser console for API errors

## Related Documentation
- [Function to Endpoint Mapping](./FUNCTION-TO-ENDPOINT-MAPPING.md)
- [Path Parameter Detection](./PATH-PARAMETER-DETECTION.md)
- [Query Parameter Handling](./QUERY-PARAMETER-FIX.md)
- API Designer Guide (TBD)
- Database Schema Management (TBD)

---

**Last Updated**: October 15, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
