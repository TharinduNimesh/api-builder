# Dynamic Path Parameter Detection

## Overview
The Map Function to Endpoint feature now intelligently detects when builders add parameters to the endpoint path and automatically adjusts the parameter locations accordingly.

## How It Works

### Scenario 1: Default Behavior (No Path Parameters)

**Function:**
```sql
get_user_details(user_id integer, include_orders boolean)
```

**Auto-Generated Path:**
```
/functions/get_user_details
```

**Parameter Detection:**
- `user_id: integer` → **query** parameter
- `include_orders: boolean` → **query** parameter

**Result:**
```
GET /functions/get_user_details?user_id=123&include_orders=true
```

---

### Scenario 2: Builder Adds Path Parameters

**Function:**
```sql
get_user_details(user_id integer, include_orders boolean)
```

**Builder Edits Path To:**
```
/users/{user_id}/details
```

**Dynamic Parameter Detection:**
- `user_id: integer` → **path** parameter ✨ (detected in path!)
- `include_orders: boolean` → **query** parameter

**Result:**
```
GET /users/123/details?include_orders=true
```

---

### Scenario 3: Multiple Path Parameters

**Function:**
```sql
get_order_item(user_id integer, order_id integer, item_id integer)
```

**Builder Edits Path To:**
```
/users/{user_id}/orders/{order_id}/items/{item_id}
```

**Dynamic Parameter Detection:**
- `user_id: integer` → **path** parameter ✨
- `order_id: integer` → **path** parameter ✨
- `item_id: integer` → **path** parameter ✨

**Result:**
```
GET /users/123/orders/456/items/789
```

---

### Scenario 4: Mixed Path and Query Parameters

**Function:**
```sql
search_products(category_id integer, min_price numeric, max_price numeric, sort_by text)
```

**Builder Edits Path To:**
```
/categories/{category_id}/products
```

**Dynamic Parameter Detection:**
- `category_id: integer` → **path** parameter ✨
- `min_price: numeric` → **query** parameter
- `max_price: numeric` → **query** parameter
- `sort_by: text` → **query** parameter

**Result:**
```
GET /categories/5/products?min_price=10&max_price=100&sort_by=price_asc
```

---

### Scenario 5: POST Request with Path Parameters

**Function:**
```sql
create_user_order(user_id integer, items json, total numeric)
```

**Builder Edits Path To:**
```
/users/{user_id}/orders
```

**Dynamic Parameter Detection:**
- `user_id: integer` → **path** parameter ✨
- `items: json` → **body** parameter
- `total: numeric` → **body** parameter

**Result:**
```
POST /users/123/orders
Body: {
  "items": [...],
  "total": 99.99
}
```

---

## UI Indicators

### Parameter Badge Display

**Before editing path (default):**
```
┌─────────────────────────────────────┐
│ Detected Parameters                 │
├─────────────────────────────────────┤
│ [user_id: integer (query)]          │
│ [order_id: integer (query)]         │
│                                     │
│ These will be exposed as query      │
│ parameters in the API               │
└─────────────────────────────────────┘
```

**After editing path to `/users/{user_id}/orders`:**
```
┌─────────────────────────────────────┐
│ Detected Parameters                 │
├─────────────────────────────────────┤
│ [user_id: integer (path)] ← Blue    │
│ [order_id: integer (query)] ← Gray  │
│                                     │
│ Parameters in path placeholders     │
│ will be used as path parameters,    │
│ others as query parameters          │
└─────────────────────────────────────┘
```

**Visual Distinction:**
- **Path parameters**: Default (blue) badge variant
- **Query/Body parameters**: Secondary (gray) badge variant
- **Location label**: Shows `(path)`, `(query)`, or `(body)` next to each parameter

---

## Technical Implementation

### 1. Path Parameter Detection (useMemo Hook)
```typescript
const pathParams = useMemo(() => {
  const params: string[] = [];
  const pathRe = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = pathRe.exec(path)) !== null) {
    if (!params.includes(m[1])) params.push(m[1]);
  }
  return params;
}, [path]);
```

**Triggers on:**
- Initial path generation
- Every keystroke in path input field
- Method change (GET ↔ POST)

### 2. Parameter Location Assignment
```typescript
const params = parsedParams.map(p => {
  const isInPath = pathParams.includes(p.name);
  return {
    name: p.name,
    in: isInPath ? 'path' : (method === 'GET' ? 'query' : 'body'),
    type: mapPostgresTypeToParamType(p.type),
    required: true,
  };
});
```

**Decision Tree:**
```
Is parameter in path placeholders?
├─ YES → 'path'
└─ NO
   ├─ Method is GET → 'query'
   └─ Method is POST → 'body'
```

### 3. Real-time UI Update
```typescript
{parsedParams.map((param, idx) => {
  const isInPath = pathParams.includes(param.name);
  const location = isInPath ? 'path' : (method === 'GET' ? 'query' : 'body');
  return (
    <Badge 
      variant={isInPath ? 'default' : 'secondary'} 
      className="font-mono text-xs"
    >
      {param.name}: {param.type}
      <span className="ml-1.5 opacity-70">({location})</span>
    </Badge>
  );
})}
```

---

## User Experience

### Step-by-Step Flow

1. **Open Map Function Modal**
   - Auto-generated path: `/functions/get_user_details`
   - All parameters shown as `query`

2. **Builder Edits Path**
   - Types: `/users/{user_id}/details`
   - UI updates in real-time
   - `user_id` badge turns blue, shows `(path)`

3. **Builder Sees Visual Feedback**
   - Help text updates to mention path parameters
   - Badge colors distinguish path from query params
   - Location labels show exactly where each param goes

4. **Submit & Create Endpoint**
   - Backend receives correct parameter locations
   - Endpoint works immediately with proper routing

5. **Further Editing Available**
   - Blue banner reminds: "You can always edit and fine-tune this endpoint later in **API Designer**"
   - Full wizard available for complex configurations

---

## Benefits

### For Builders
✅ **Flexibility**: Can customize URL structure (RESTful paths)
✅ **Visual Feedback**: See parameter locations update in real-time
✅ **No Manual Configuration**: Automatic detection, zero extra clicks
✅ **RESTful Best Practices**: Encourages semantic URL design
✅ **Edit Anytime**: Can refine in API Designer later

### For API Consumers
✅ **Cleaner URLs**: `/users/123/orders` vs `/users?user_id=123`
✅ **RESTful Design**: Follows REST conventions
✅ **Better SEO**: Path parameters better for caching/indexing
✅ **Type Safety**: Backend validates path parameter types

---

## Examples from Real-World Use Cases

### E-commerce API
```
Function: get_product_reviews(product_id integer, rating integer, limit integer)
Path: /products/{product_id}/reviews
Result: GET /products/42/reviews?rating=5&limit=10
```

### User Management API
```
Function: update_user_profile(user_id integer, data json)
Path: /users/{user_id}/profile
Method: POST
Result: POST /users/123/profile + body
```

### Multi-tenant API
```
Function: get_tenant_stats(tenant_id text, date_from timestamp, date_to timestamp)
Path: /tenants/{tenant_id}/analytics
Result: GET /tenants/acme-corp/analytics?date_from=...&date_to=...
```

### Nested Resources
```
Function: add_comment_reply(post_id integer, comment_id integer, content text)
Path: /posts/{post_id}/comments/{comment_id}/replies
Method: POST
Result: POST /posts/45/comments/67/replies + body
```

---

## Edge Cases Handled

### 1. Parameter Not in Function
```
Path: /users/{customer_id}/orders
Function params: user_id, order_id
Result: Backend will add {customer_id} as extra path param
```

### 2. Duplicate Path Parameters
```
Path: /users/{id}/profile/{id}
Result: Only one {id} parameter created
```

### 3. Mixed Case Sensitivity
```
Function: get_data(userId integer)
Path: /users/{userId}  ✅ Works
Path: /users/{UserId}  ❌ Won't match (case-sensitive)
```

### 4. Special Characters in Path
```
Path: /api/v1/users-{user_id}/data
Result: {user_id} detected as path parameter
```

---

## Editing in API Designer

After mapping a function to an endpoint, builders can access the full **Endpoint Wizard** in API Designer to:

1. **Add More Parameters**: Define extra params not in the function
2. **Change Parameter Types**: Override type detection
3. **Make Parameters Optional**: Toggle `required` flag
4. **Add Validation**: Custom regex, min/max values (future)
5. **Update SQL Query**: Modify the function call
6. **Change Access Control**: Update authentication/roles
7. **Add Rate Limiting**: Configure throttling (future)

**Access via:**
- API Designer page → Click **Edit** icon on endpoint card
- Full wizard with 4 steps: Basic Info → SQL Query → Parameters → Access Control

---

## Summary

The dynamic path parameter detection feature provides:
- 🎯 **Smart Detection**: Automatic identification of path vs query/body params
- 🎨 **Visual Feedback**: Color-coded badges and location labels
- ⚡ **Real-time Updates**: Changes reflected instantly as you type
- 🔄 **Full Flexibility**: Edit anytime in API Designer
- 📚 **RESTful Design**: Encourages best practices for URL structure

Builders can now create professional, RESTful APIs with custom URL structures while maintaining type safety and automatic parameter handling!
