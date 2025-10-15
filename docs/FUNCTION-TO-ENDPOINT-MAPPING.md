# Function to Endpoint Mapping Feature

## Overview
The **Map Function to Endpoint** feature allows builders to quickly create REST API endpoints that execute PostgreSQL functions directly from the Functions page. This provides a seamless integration between database functions and API endpoints.

## Features Implemented

### 1. **Smart Auto-Suggestions**
When mapping a function to an endpoint, the system automatically suggests:
- **Endpoint Path**: Generated as `/functions/{function_name}`
- **HTTP Method**: 
  - `POST` for functions with mutation keywords (insert, update, delete, create, remove, add)
  - `GET` for all other functions (queries)
- **Description**: Auto-generated based on function name and parameter count
- **SQL Query**: Complete SELECT statement with proper parameter placeholders

### 2. **Parameter Parsing & Conversion**
- Parses PostgreSQL function parameters from format: `param1 type1, param2 type2`
- Converts PostgreSQL types to API parameter types:
  - `integer`, `bigint`, `serial` → `integer`
  - `numeric`, `decimal`, `real`, `double` → `number`
  - `boolean`, `bool` → `boolean`
  - `json`, `jsonb` → `object`
  - Arrays → `array`
  - All others → `string`
- Automatically sets parameter location:
  - GET requests: parameters in `query`
  - POST requests: parameters in `body`

### 3. **Access Control Integration**
Complete protection and role-based access control:
- **Authentication Toggle**: Require users to be authenticated
- **Role Selection**: Choose specific roles that can access the endpoint
- **Role Options**: 
  - Leave empty: all authenticated users can access
  - Select roles: only users with those roles can access
- Loads project roles dynamically from project settings

### 4. **Real-time Validation**
- Path must start with `/`
- SQL query cannot be empty
- Parameter detection and preview
- Type casting and validation

### 5. **User Experience**
- **Function Info Banner**: Shows function details (schema, name, parameters, return type)
- **Method Selection**: Dropdown to choose GET or POST
- **Editable Fields**: All suggestions are editable by the builder
- **Parameter Preview**: Badge display of detected parameters with types
- **Visual Feedback**: Loading states, success/error toasts
- **Responsive Design**: Works on all screen sizes

## Usage Flow

### From Functions Page:
1. Click the **Settings** icon on any function card
2. MapFunctionModal opens with auto-suggestions
3. Review/edit the suggested configuration:
   - HTTP method
   - Endpoint path
   - Description
   - SQL query
4. Configure access control (optional):
   - Toggle "Require Authentication"
   - Select allowed roles (if needed)
5. Click "Map to Endpoint"
6. Success! Endpoint is created and ready to use

## Technical Architecture

### Components Modified
- **MapFunctionModal.tsx**: Complete rewrite with full functionality
- **Functions.tsx**: Added `onSuccess` callback to refresh after mapping

### Backend Integration
Uses the same endpoint service as API Designer:
- `endpointService.createEndpoint(payload)`
- Validates SQL, parameters, and path
- Stores in `SysEndpoint` table
- Immediately available for execution

### Parameter Flow
```
Function Definition: "user_id integer, name text, active boolean"
       ↓
Parse to Array: [{name: "user_id", type: "integer"}, ...]
       ↓
Convert Types: integer → integer, text → string, boolean → boolean
       ↓
Map to Endpoint Params: [{name: "user_id", in: "query", type: "integer", required: true}, ...]
       ↓
Generate SQL Placeholders: SELECT * FROM function({user_id}, {name}, {active})
```

### SQL Generation Examples

**Function with parameters:**
```sql
-- Function: get_active_users(min_age integer, role_name text)
-- Generated SQL:
SELECT * FROM public.get_active_users({min_age}, {role_name})
```

**Function without parameters:**
```sql
-- Function: list_all_products()
-- Generated SQL:
SELECT * FROM public.list_all_products()
```

**Function with complex types:**
```sql
-- Function: process_order(order_data json, user_id integer)
-- Generated SQL:
SELECT * FROM public.process_order({order_data}, {user_id})
```

## Security Features

### Type Safety
- PostgreSQL parameter types validated
- API parameter types enforced
- SQL injection protection via parameterized queries

### Access Control
- Optional authentication requirement
- Role-based access control (RBAC)
- Inherits project-level role definitions

### Validation
- Path validation (must start with `/`)
- SQL syntax checking
- Parameter name validation
- Type compatibility checks

## User Benefits

### For Builders
- **Fast Development**: Create API endpoints in seconds
- **No Manual SQL Writing**: Auto-generated queries
- **Type Safety**: Automatic type conversion
- **Security Built-in**: Easy to add authentication and roles
- **Consistent**: Same backend as API Designer

### For End Users
- **RESTful APIs**: Standard HTTP methods (GET, POST)
- **Well-documented**: Clear parameter types and descriptions
- **Secure**: Protected endpoints with role-based access
- **Performant**: Direct function execution

## Example Scenarios

### Scenario 1: Public Query Function
```
Function: get_product_by_id(product_id integer)
→ GET /products/{product_id}
→ Public access
→ Returns product details
```

### Scenario 2: Protected Mutation Function
```
Function: create_order(user_id integer, items json, total numeric)
→ POST /orders/create
→ Protected (authentication required)
→ Roles: admin, user
→ Creates new order
```

### Scenario 3: Admin-Only Function
```
Function: delete_user(user_id integer)
→ POST /admin/users/delete
→ Protected
→ Roles: admin only
→ Deletes user account
```

## Future Enhancements (Potential)
- Support for path parameters (e.g., `/users/{id}`)
- Custom parameter names (override function param names)
- Request/response transformations
- Rate limiting configuration
- Caching options
- Batch operations support

## Testing Checklist
- ✅ Function with parameters maps correctly
- ✅ Function without parameters maps correctly
- ✅ GET method generates query parameters
- ✅ POST method generates body parameters
- ✅ PostgreSQL types convert to API types
- ✅ SQL query uses correct placeholders
- ✅ Authentication toggle works
- ✅ Role selection works
- ✅ Empty roles = all authenticated users
- ✅ Endpoint created successfully
- ✅ Endpoint appears in API Designer
- ✅ Endpoint is executable via RunEndpointDialog
- ✅ Protected endpoints require authentication
- ✅ Role restrictions enforced

## Conclusion
The Function to Endpoint Mapping feature bridges the gap between PostgreSQL functions and REST APIs, enabling rapid API development with built-in security and type safety. Builders can now expose database functions as RESTful endpoints with just a few clicks, complete with authentication and role-based access control.
