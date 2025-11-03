# GraphQL Authentication & Authorization System

This document explains how to use the authentication and authorization directives in the GraphQL API.

## Overview

The API uses **GraphQL schema directives** for declarative authentication and authorization:

- `@auth` - Ensures user is authenticated
- `@hasRole(roles: [String!]!)` - Ensures user has one of the required roles
- `@hasPermission(permission: String!)` - Ensures user has a specific permission

## Directives

### @auth

Ensures the user is authenticated. If no user is present in the context, returns an error.

```graphql
type Query {
  user(id: ID!): User @auth
}
```

### @hasRole

Ensures the authenticated user has one of the specified roles.

```graphql
type Mutation {
  createUser(data: UserInput!): User! @auth @hasRole(roles: ["CLINIC_ADMIN"])
}
```

**Available Roles:**
- `CLINIC_ADMIN` - Full access to all clinic resources
- `DOCTOR` - Access to own patients and appointments
- `ASSISTANT` - Can manage patients and appointments
- `PATIENT` - Read-only access to own data

### @hasPermission

Ensures the user has a specific fine-grained permission.

```graphql
type Mutation {
  cancelAppointment(id: ID!): Appointment! @auth @hasPermission(permission: "appointment:cancel")
}
```

**Permission Format:** `<resource>:<action>`

Examples:
- `appointment:create`
- `appointment:cancel`
- `patient:update`
- `clinic:settings`

## Available Permissions

See [permissions.ts](src/common/auth/permissions.ts) for the complete list:

- **User:** `user:read`, `user:create`, `user:update`, `user:delete`
- **Appointment:** `appointment:read`, `appointment:create`, `appointment:update`, `appointment:cancel`
- **Patient:** `patient:read`, `patient:create`, `patient:update`, `patient:delete`
- **Doctor:** `doctor:read`, `doctor:create`, `doctor:update`, `doctor:delete`
- **Clinic:** `clinic:read`, `clinic:update`, `clinic:settings`
- And more...

## Role-Permission Mapping

Each role has default permissions defined in [permissions.ts](src/common/auth/permissions.ts):

| Role           | Permissions                                           |
|----------------|-------------------------------------------------------|
| CLINIC_ADMIN   | All permissions                                       |
| DOCTOR         | Read patients, manage own appointments                |
| ASSISTANT      | Manage patients and appointments                      |
| PATIENT        | Read own appointments and profile                     |

## Authentication Flow

1. **Client sends request** with `Authorization: Bearer <token>` header
2. **Apollo Server context** extracts the token via `authenticateUser()`
3. **User is attached to context** with their role and permissions
4. **Directives check** authentication and authorization before resolver execution
5. **Resolver executes** if all checks pass

## Development Mode

For development, you can use a mock token:

```bash
curl -X POST http://localhost:3000/ \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer dev-admin-token' \
  -d '{"query":"{ users { id email role } }"}'
```

The mock token `dev-admin-token` gives you CLINIC_ADMIN access.

## Production Setup

1. **Install JWT library:**
   ```bash
   npm install jsonwebtoken @types/jsonwebtoken
   ```

2. **Update auth.middleware.ts** to use real JWT verification (example provided in comments)

3. **Set JWT_SECRET** environment variable

4. **Issue tokens** on login with user info and expiration

## Example Usage in Schema

```graphql
type Query {
  # Anyone authenticated can read their own user
  me: User! @auth

  # Only admins can list all users
  users: [User!]! @auth @hasRole(roles: ["CLINIC_ADMIN"])

  # Authenticated users can read specific user
  user(id: ID!): User @auth
}

type Mutation {
  # Only admins can create users
  createUser(data: UserInput!): User!
    @auth
    @hasRole(roles: ["CLINIC_ADMIN"])

  # Admins and assistants can create appointments
  createAppointment(data: AppointmentInput!): Appointment!
    @auth
    @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])
    @hasPermission(permission: "appointment:create")

  # Fine-grained permission for canceling
  cancelAppointment(id: ID!): Appointment!
    @auth
    @hasPermission(permission: "appointment:cancel")
}
```

## Error Responses

### Unauthenticated (401)

```json
{
  "errors": [{
    "message": "Unauthorized: User not authenticated",
    "extensions": {
      "code": "UNAUTHENTICATED"
    }
  }]
}
```

### Forbidden - Insufficient Role (403)

```json
{
  "errors": [{
    "message": "Forbidden: Insufficient role",
    "extensions": {
      "code": "FORBIDDEN",
      "requiredRoles": ["CLINIC_ADMIN"],
      "userRole": "DOCTOR"
    }
  }]
}
```

### Forbidden - Missing Permission (403)

```json
{
  "errors": [{
    "message": "Forbidden: Missing required permission",
    "extensions": {
      "code": "FORBIDDEN",
      "requiredPermission": "appointment:cancel",
      "userPermissions": ["appointment:read"]
    }
  }]
}
```

## Testing Directives

```bash
# Start the server
npx nx serve api

# Test without auth (should fail)
curl -X POST http://localhost:3000/ \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ users { id } }"}'

# Test with auth (should succeed with mock token)
curl -X POST http://localhost:3000/ \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer dev-admin-token' \
  -d '{"query":"{ users { id email role } }"}'
```

## Architecture

```
src/
  common/
    auth/
      auth.directive.ts       # @auth implementation
      role.directive.ts       # @hasRole implementation
      permission.directive.ts # @hasPermission implementation
      auth.middleware.ts      # JWT verification
      permissions.ts          # Permission definitions
    types/
      context.ts             # GraphQL context type
  graphql/
    directives.ts            # Directive type definitions
    schema.ts                # GraphQL schema with directives
  main.ts                    # Server setup with directive integration
```

## Best Practices

1. **Always use @auth** for protected endpoints
2. **Combine directives** for layered security
3. **Use @hasPermission** for fine-grained control
4. **Define permissions centrally** in permissions.ts
5. **Log sensitive operations** in AuditLog
6. **Filter by clinicId** in all queries (multi-tenancy)

## Context Object

Every resolver receives a context object:

```typescript
interface Context {
  prisma: PrismaClient;
  user?: AuthUser;
  clinicId?: string;
}

interface AuthUser {
  id: string;
  email: string;
  role: 'CLINIC_ADMIN' | 'DOCTOR' | 'ASSISTANT' | 'PATIENT';
  clinicId: string;
  permissions: string[];
}
```

## Next Steps

1. Implement JWT authentication in production
2. Add refresh token mechanism
3. Implement password reset flow
4. Add rate limiting for security
5. Set up audit logging for all mutations
6. Implement row-level security with clinicId filtering
