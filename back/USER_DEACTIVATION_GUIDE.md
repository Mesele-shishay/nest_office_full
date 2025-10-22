# User Deactivation by Administrative Scope

This guide explains the new hierarchical user deactivation functionality that allows administrators to deactivate users based on their administrative scope (city, state, country).

## Overview

The system now supports hierarchical user deactivation where:

- **ADMIN** users can deactivate any user
- **COUNTRY_ADMIN** users can deactivate users within their country scope
- **STATE_ADMIN** users can deactivate users within their state scope
- **CITY_ADMIN** users can deactivate users within their city scope

## API Endpoints

### 1. Deactivate Single User

```
PATCH /users/:id/deactivate
```

**Required Permissions:**

- Role: ADMIN, COUNTRY_ADMIN, STATE_ADMIN, or CITY_ADMIN
- Permission: MANAGE_SCOPE_USERS

**Example Request:**

```bash
curl -X PATCH "http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000/deactivate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Activate Single User

```
PATCH /users/:id/activate
```

**Required Permissions:**

- Role: ADMIN, COUNTRY_ADMIN, STATE_ADMIN, or CITY_ADMIN
- Permission: MANAGE_SCOPE_USERS

**Example Request:**

```bash
curl -X PATCH "http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000/activate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Bulk Deactivate Users

```
POST /users/bulk-deactivate
```

**Required Permissions:**

- Role: ADMIN, COUNTRY_ADMIN, STATE_ADMIN, or CITY_ADMIN
- Permission: MANAGE_SCOPE_USERS

**Request Body:**

```json
{
  "userIds": [
    "123e4567-e89b-12d3-a456-426614174000",
    "987fcdeb-51a2-43d1-b456-426614174000"
  ]
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3000/users/bulk-deactivate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [
      "123e4567-e89b-12d3-a456-426614174000",
      "987fcdeb-51a2-43d1-b456-426614174000"
    ]
  }'
```

### 4. Bulk Activate Users

```
POST /users/bulk-activate
```

**Required Permissions:**

- Role: ADMIN, COUNTRY_ADMIN, STATE_ADMIN, or CITY_ADMIN
- Permission: MANAGE_SCOPE_USERS

**Request Body:**

```json
{
  "userIds": [
    "123e4567-e89b-12d3-a456-426614174000",
    "987fcdeb-51a2-43d1-b456-426614174000"
  ]
}
```

## Scope Validation Rules

### For Hierarchical Admins

1. **Scope Validation**: Users can only deactivate users within their administrative scope
2. **Role Hierarchy**: Users cannot deactivate users with equal or higher administrative roles
3. **Geographic Scope**: The system validates that target users are within the admin's geographic scope

### Role Hierarchy (from lowest to highest)

1. USER (0)
2. MANAGER (1)
3. CITY_ADMIN (2)
4. STATE_ADMIN (3)
5. COUNTRY_ADMIN (4)
6. ADMIN (5)

### Examples

#### Country Admin Scope

A COUNTRY_ADMIN with scope `{"countryIds": ["US", "CA"]}` can deactivate:

- Regular users and managers in the US or Canada
- CITY_ADMIN and STATE_ADMIN users within their country scope
- Cannot deactivate other COUNTRY_ADMIN or ADMIN users

#### State Admin Scope

A STATE_ADMIN with scope `{"stateIds": ["CA", "NY"]}` can deactivate:

- Regular users and managers in California or New York
- CITY_ADMIN users within their state scope
- Cannot deactivate STATE_ADMIN, COUNTRY_ADMIN, or ADMIN users

#### City Admin Scope

A CITY_ADMIN with scope `{"cityIds": ["SF", "LA"]}` can deactivate:

- Regular users and managers in San Francisco or Los Angeles
- Cannot deactivate any admin-level users

## Error Responses

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "You can only deactivate users within your administrative scope",
  "error": "Forbidden"
}
```

### 403 Forbidden - Role Hierarchy

```json
{
  "statusCode": 403,
  "message": "You cannot deactivate users with equal or higher administrative roles",
  "error": "Forbidden"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "User with ID 123e4567-e89b-12d3-a456-426614174000 not found",
  "error": "Not Found"
}
```

## Bulk Operation Response

Bulk operations return detailed results showing which users were successfully processed and which failed:

```json
{
  "message": "Bulk deactivation completed",
  "data": {
    "deactivated": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user1@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "USER",
        "isActive": false
      }
    ],
    "failed": [
      {
        "userId": "987fcdeb-51a2-43d1-b456-426614174000",
        "reason": "You can only deactivate users within your administrative scope"
      }
    ]
  }
}
```

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT authentication
2. **Permission Validation**: Users must have the `MANAGE_SCOPE_USERS` permission
3. **Scope Enforcement**: Hierarchical admins can only affect users within their scope
4. **Role Hierarchy**: Users cannot deactivate users with equal or higher roles
5. **Audit Trail**: All deactivation actions are logged with user information

## Integration with Existing Features

- The `isActive` field already existed in the User entity
- Existing `toggleActiveStatus` method remains available for ADMIN users
- New scope-based methods provide granular control for hierarchical admins
- All existing user queries support filtering by `isActive` status

## Testing

To test the functionality:

1. Create users with different roles and scopes
2. Authenticate as different admin types
3. Attempt to deactivate users within and outside your scope
4. Verify that role hierarchy is enforced
5. Test bulk operations with mixed success/failure scenarios
