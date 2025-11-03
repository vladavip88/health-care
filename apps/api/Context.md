# 🧠 Prisma Context — Clinic Management Platform

## 🗄️ Database Overview

This project uses **PostgreSQL** with **Prisma ORM**.  
Each record belongs to a tenant (`Clinic`) and is linked through `clinicId`.  
The architecture follows a **multi-tenant SaaS** pattern.

### Main Models

| Model                       | Description                                                             |
| --------------------------- | ----------------------------------------------------------------------- |
| **Clinic**                  | Tenant root — represents a single medical clinic.                       |
| **User**                    | Authentication and role definition (ADMIN, DOCTOR, ASSISTANT, PATIENT). |
| **Doctor**                  | 1:1 relation with `User`. Holds specialty, bio, and working hours.      |
| **Assistant**               | 1:1 relation with `User`. Handles appointments and patients.            |
| **Patient**                 | Client of the clinic; optionally linked to a `User` account.            |
| **Appointment**             | Connects Doctor + Patient + Clinic; core scheduling entity.             |
| **WeeklySlot**              | Defines a doctor's weekly working hours.                                |
| **ReminderRule / Reminder** | Automates patient notifications (SMS/Email).                            |
| **WebhookEndpoint**         | Sends real-time events to external integrations.                        |
| **AuditLog**                | Tracks all system actions for security and analytics.                   |

---

## 🔑 Tenancy Rules

All data is **tenant-scoped** by `clinicId`.

- Every query and mutation must include a `clinicId` filter.
- Users can only access data within their own clinic.

**Example:**

```ts
await prisma.patient.findMany({
  where: { clinicId: ctx.clinicId },
});
```

The `clinicId` value comes from the authenticated `User` session (`ctx.user.clinicId`).

---

## 👥 Roles and Access Levels

The platform supports four primary roles.  
Each role determines the allowed actions within a clinic.

| **Role**       | **Description**                                                   | **Access Scope**                                                                                             |
| -------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `CLINIC_ADMIN` | The clinic’s main administrator. Has full access to all entities. | Can manage users, doctors, assistants, patients, appointments, reminders, integrations, and clinic settings. |
| `DOCTOR`       | A medical professional (1:1 linked to a `User`).                  | Can view and manage only their own appointments and patients. No access to clinic settings or other doctors. |
| `ASSISTANT`    | Operational staff (nurse, receptionist, etc.).                    | Can create, update, and cancel appointments, and manage patients. Cannot manage users or clinic settings.    |
| `PATIENT`      | A client using the patient portal.                                | Can view only their own appointments and profile. No write access.                                           |

---

## 🔐 Context Object (API / GraphQL)

Each resolver or service receives a shared **Context** object.

```ts
export interface Context {
  prisma: PrismaClient;
  user: {
    id: string;
    role: 'CLINIC_ADMIN' | 'DOCTOR' | 'ASSISTANT' | 'PATIENT';
    clinicId: string;
  };
  clinicId: string;
}
```

**Usage Example:**

```ts
const appointments = await ctx.prisma.appointment.findMany({
  where: { clinicId: ctx.clinicId },
});
```

---

## 🧱 Repository Pattern Convention

Each entity has its own repository and service layer for clean separation of logic.

**Folder structure:**

```
src/modules/<entity>/<entity>.repository.ts
src/modules/<entity>/<entity>.service.ts
```

**Example — `appointment.repository.ts`:**

```ts
export const appointmentRepository = (prisma: PrismaClient) => ({
  findByDoctor: (doctorId: string, clinicId: string) => prisma.appointment.findMany({ where: { doctorId, clinicId } }),

  create: (data: Prisma.AppointmentCreateInput) => prisma.appointment.create({ data }),

  cancel: (id: string, clinicId: string) =>
    prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    }),
});
```

---

## 🧠 Context Rules for Coding Agent

When generating or refactoring code, the AI agent should always follow these principles:

- Always include `clinicId` in every Prisma query.
- Always check `ctx.user.role` for authorization before write operations.
- When creating related records, connect existing entities explicitly:

```ts
clinic: { connect: { id: ctx.clinicId } },
createdBy: { connect: { id: ctx.user.id } },
```

- Use Prisma `include` or `select` to prevent N+1 queries.
- Every meaningful action must log into `AuditLog` via `auditService.log()`:

```ts
await ctx.audit.log('appointment.create', 'Appointment', id, { patientId });
```

---

## 🔁 Example Service Flow

**Creating an Appointment:**

```ts
async function createAppointment(ctx: Context, input: CreateAppointmentInput) {
  const appointment = await ctx.prisma.appointment.create({
    data: {
      start: input.start,
      end: input.end,
      reason: input.reason,
      clinic: { connect: { id: ctx.clinicId } },
      doctor: { connect: { id: input.doctorId } },
      patient: { connect: { id: input.patientId } },
      createdBy: { connect: { id: ctx.user.id } },
    },
  });

  await reminderService.scheduleForAppointment(ctx, appointment);
  await ctx.audit.log('appointment.create', 'Appointment', appointment.id);

  return appointment;
}
```

---

## ⚙️ Helper Services

| Service             | Purpose                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------- |
| **reminderService** | Generates and sends reminders based on active `ReminderRule`s.                            |
| **webhookService**  | Emits events (`appointment.created`, `reminder.sent`, etc.) to active `WebhookEndpoint`s. |
| **auditService**    | Logs every action into `AuditLog`.                                                        |
| **authMiddleware**  | Authenticates the user and populates `ctx.user` and `ctx.clinicId`.                       |

---

## 🧩 Audit Logging Example

```ts
await ctx.audit.log({
  clinicId: ctx.clinicId,
  actorId: ctx.user.id,
  action: 'appointment.cancel',
  entity: 'Appointment',
  entityId: appointment.id,
  metadata: { reason: 'Patient cancelled 2 hours before' },
});
```

---

## 🔍 Multi-Tenant Query Examples

**Filter by clinic:**

```ts
await prisma.doctor.findMany({
  where: { clinicId: ctx.clinicId },
});
```

**Scoped patient search:**

```ts
await prisma.patient.findMany({
  where: {
    clinicId: ctx.clinicId,
    lastName: { contains: searchTerm, mode: 'insensitive' },
  },
});
```

---

## 🧠 Summary

> All entities are tenant-scoped via `clinicId`.  
> Every query and mutation must respect this constraint.  
> Use Prisma’s type-safe API with the repository pattern to maintain clean, isolated logic.  
> All business operations should emit audit logs and reminders automatically.

---

**File Purpose:**  
This document defines the **project context** for coding agents and developers.  
It describes the database schema, tenancy model, context structure, and coding conventions for Prisma-based development.

# API project structure

```
api/
    src/
      modules/
        clinic/
          clinic.schema.ts
          clinic.resolver.ts
          clinic.queries.ts
          clinic.mutations.ts
          clinic.service.ts
          clinic.repository.ts
        user/
          user.schema.ts
          user.resolver.ts
          user.queries.ts
          user.mutations.ts
          user.service.ts
          user.repository.ts
        doctor/
          doctor.schema.ts
          doctor.resolver.ts
          doctor.queries.ts
          doctor.mutations.ts
          doctor.service.ts
          doctor.repository.ts
        assistant/
          assistant.schema.ts
          assistant.resolver.ts
          assistant.queries.ts
          assistant.mutations.ts
          assistant.service.ts
          assistant.repository.ts
        patient/
          patient.schema.ts
          patient.resolver.ts
          patient.queries.ts
          patient.mutations.ts
          patient.service.ts
          patient.repository.ts
        appointment/
          appointment.schema.ts
          appointment.resolver.ts
          appointment.queries.ts
          appointment.mutations.ts
          appointment.service.ts
          appointment.repository.ts
        reminder/
          reminder.schema.ts
          reminder.resolver.ts
          reminder.queries.ts
          reminder.mutations.ts
          reminder.service.ts
          reminder.repository.ts
        webhook/
          webhook.schema.ts
          webhook.resolver.ts
          webhook.queries.ts
          webhook.mutations.ts
          webhook.service.ts
          webhook.repository.ts
        audit/
          audit.schema.ts
          audit.resolver.ts
          audit.queries.ts
          audit.mutations.ts
          audit.service.ts
          audit.repository.ts
      common/
        context.ts
        prisma.ts
        auth/
          auth.middleware.ts
          rbac.guard.ts
        errors/
          error.types.ts
          error.handler.ts
      graphql/
        schema.ts
        index.ts
      main.ts
    package.json
```

# 🧩 GraphQL Module Architecture — Query & Mutation Separation (v2)

## 🎯 Purpose

This document defines the **updated module structure** used for GraphQL API development.  
It separates **queries** and **mutations** from the main resolver file for better readability, modularity, and maintainability.

---

## 🧱 Folder Structure per Module

Each module lives inside `src/modules/<entity>/` and follows this layout:

```
src/
  modules/
    appointment/
      appointment.schema.ts
      appointment.resolver.ts
      appointment.queries.ts
      appointment.mutations.ts
      appointment.service.ts
      appointment.repository.ts
```

---

## ⚙️ Layer Responsibilities

| Layer          | Responsibility                                        | Depends On          |
| -------------- | ----------------------------------------------------- | ------------------- |
| **Repository** | Handles all direct database access using Prisma.      | Prisma              |
| **Service**    | Contains business logic, RBAC, tenancy, and auditing. | Repository, Context |
| **Queries**    | Read-only operations (GraphQL `Query` root).          | Service             |
| **Mutations**  | Write operations (GraphQL `Mutation` root).           | Service             |
| **Resolver**   | Combines queries & mutations into GraphQL schema.     | Queries, Mutations  |

---

## 🧩 1️⃣ Repository Layer

Handles only low-level database access.  
It should not know about context, roles, or clinic filtering.

**Example — `appointment.repository.ts`:**

```ts
export const appointmentRepository = (prisma: PrismaClient) => ({
  findById: (id: string) =>
    prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true, patient: true },
    }),

  findManyByClinic: (clinicId: string) =>
    prisma.appointment.findMany({
      where: { clinicId },
      include: { doctor: true, patient: true },
    }),

  create: (data: Prisma.AppointmentCreateInput) => prisma.appointment.create({ data }),

  updateStatus: (id: string, status: string) => prisma.appointment.update({ where: { id }, data: { status } }),
});
```

✅ **Rules:**

- Use only Prisma calls.
- Never access context (`ctx`).
- Never include RBAC or business logic.

---

## 🧠 2️⃣ Service Layer

Implements business logic, authorization, tenancy, and auditing.  
It injects both the repository and the GraphQL context.

**Example — `appointment.service.ts`:**

```ts
import { requireRole } from '../../common/auth/rbac.guard';
import { appointmentRepository } from './appointment.repository';

export const appointmentService = (ctx) => {
  const repo = appointmentRepository(ctx.prisma);

  return {
    list: async () => {
      requireRole(ctx, ['CLINIC_ADMIN', 'DOCTOR', 'ASSISTANT']);
      return repo.findManyByClinic(ctx.clinicId);
    },

    create: async (data) => {
      requireRole(ctx, ['CLINIC_ADMIN', 'ASSISTANT']);
      const appointment = await repo.create({
        ...data,
        clinic: { connect: { id: ctx.clinicId } },
        createdBy: { connect: { id: ctx.user.id } },
      });

      await ctx.audit?.log('appointment.create', 'Appointment', appointment.id);
      return appointment;
    },

    cancel: async (id) => {
      requireRole(ctx, ['CLINIC_ADMIN', 'ASSISTANT']);
      const appointment = await repo.updateStatus(id, 'CANCELLED');
      await ctx.audit?.log('appointment.cancel', 'Appointment', id);
      return appointment;
    },
  };
};
```

✅ **Rules:**

- Always validate roles (`requireRole`).
- Always link `clinicId` and `createdBy`.
- Log every critical action in `AuditLog`.
- Never call Prisma directly from service.

---

## 🔍 3️⃣ Query Layer

Contains **read-only** GraphQL operations.  
Each query delegates to the service and returns data to the resolver.

**Example — `appointment.queries.ts`:**

```ts
import { appointmentService } from './appointment.service';

export const appointmentQueries = {
  appointments: async (_, __, ctx) => appointmentService(ctx).list(),

  appointment: async (_, { id }, ctx) => appointmentService(ctx).getById(id),
};
```

✅ **Rules:**

- Use only read-type service methods.
- Never modify data.
- Keep queries flat and simple.

---

## ⚡ 4️⃣ Mutation Layer

Handles **write** GraphQL operations such as create, update, and delete.  
It uses the same service layer but different methods.

**Example — `appointment.mutations.ts`:**

```ts
import { appointmentService } from './appointment.service';

export const appointmentMutations = {
  createAppointment: async (_, { data }, ctx) => appointmentService(ctx).create(data),

  cancelAppointment: async (_, { id }, ctx) => appointmentService(ctx).cancel(id),
};
```

✅ **Rules:**

- One method per GraphQL mutation.
- Call service-level methods for logic and auditing.
- No direct Prisma or repository usage.

---

## 🧩 5️⃣ Resolver Layer

Merges queries and mutations into the GraphQL schema entry point.

**Example — `appointment.resolver.ts`:**

```ts
import { appointmentQueries } from './appointment.queries';
import { appointmentMutations } from './appointment.mutations';

export default {
  Query: { ...appointmentQueries },
  Mutation: { ...appointmentMutations },
};
```

✅ **Rules:**

- Keep resolvers minimal.
- Do not implement logic here.
- Simply map schema → function.

---

## 🧱 6️⃣ Schema Layer

Defines the types, inputs, queries, and mutations for the module.

**Example — `appointment.schema.ts`:**

```ts
import gql from 'graphql-tag';

export default gql`
  type Appointment {
    id: ID!
    start: DateTime!
    end: DateTime!
    status: AppointmentStatus!
    doctor: Doctor!
    patient: Patient!
  }

  enum AppointmentStatus {
    PENDING
    CONFIRMED
    CANCELLED
    NOSHOW
    COMPLETED
  }

  input AppointmentInput {
    doctorId: ID!
    patientId: ID!
    start: DateTime!
    end: DateTime!
    reason: String
  }

  type Query {
    appointments: [Appointment!]!
    appointment(id: ID!): Appointment
  }

  type Mutation {
    createAppointment(data: AppointmentInput!): Appointment!
    cancelAppointment(id: ID!): Appointment!
  }
`;
```

---

## 🧠 Example Flow — “Create Appointment”

```
GraphQL Mutation → Resolver → Mutation → Service → Repository → Prisma → DB
                                           ↳ auditService.log()
                                           ↳ reminderService.schedule()
```

1. `createAppointment` mutation called from client.
2. Resolver delegates to `appointmentMutations.createAppointment`.
3. Mutation calls `appointmentService.create()`.
4. Service validates role and tenancy.
5. Repository performs the Prisma query.
6. Service triggers audit logging and reminders.
7. The created entity is returned as a GraphQL response.

---

## ✅ Benefits of This Pattern

| Benefit                       | Description                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------ |
| 🧩 **Separation of Concerns** | Read (Query) and Write (Mutation) logic are isolated.                          |
| 🔍 **Clarity**                | Developers and AI agents immediately know where to add new functionality.      |
| ⚡ **Testability**            | Each layer (Query, Mutation, Service, Repository) can be tested independently. |
| 🧠 **Maintainability**        | Clean folder structure and small, focused files.                               |
| 🛡️ **Security**               | RBAC and tenancy are consistently enforced in the service layer.               |

---

## 📁 Summary Template

```
/src/modules/<entity>/
  ├── <entity>.schema.ts      → GraphQL type definitions (SDL)
  ├── <entity>.resolver.ts    → Combines queries & mutations
  ├── <entity>.queries.ts     → Read operations
  ├── <entity>.mutations.ts   → Write operations
  ├── <entity>.service.ts     → Business logic + RBAC + auditing
  └── <entity>.repository.ts  → Prisma data access
```

---

## 🧩 Developer Guidelines

- ✅ **Resolvers**: no business logic — delegate to queries/mutations.
- ✅ **Queries/Mutations**: only coordinate service calls.
- ✅ **Services**: enforce business rules, roles, and tenancy.
- ✅ **Repositories**: interact with Prisma only.
- ✅ **Schema**: define types, inputs, and operations.
- ✅ **Auditing**: log every create/update/delete operation.

---

**File Purpose:**  
This document defines the **GraphQL module pattern (v2)** that separates Queries and Mutations into their own files.  
It ensures clarity, modularity, and maintainability for both developers and AI coding agents.

# 🔐 GraphQL Authorization System with Directives (Fine-Grained Permissions)

## 🎯 Purpose

This document describes how **authentication, authorization, roles, and fine-grained permissions** are managed in the GraphQL API using **custom directives**.  
It replaces manual authorization checks in resolvers with reusable, declarative directives.

---

## 🧩 Overview

Instead of manually calling functions like `requireRole()` or `checkPermission()` in every resolver,  
you can define **GraphQL schema directives** that enforce authentication and permissions automatically.

Example usage inside your GraphQL SDL:

```graphql
type Mutation {
  createAppointment(data: AppointmentInput!): Appointment! @auth @hasPermission(permission: "appointment:create")
  cancelAppointment(id: ID!): Appointment! @auth @hasPermission(permission: "appointment:cancel")
}
```

Each directive hooks into the GraphQL execution layer and validates the user context (`ctx.user`) before executing the resolver.

---

## ⚙️ Directory Structure

```
src/
  common/
    auth/
      auth.directive.ts
      role.directive.ts
      permission.directive.ts
      auth.utils.ts
  graphql/
    directives/
      index.ts
```

---

## 🧱 1️⃣ Authentication Directive — `@auth`

This directive ensures that a user is authenticated (i.e., has a valid JWT or session).

**Example:**

```ts
// src/common/auth/auth.directive.ts
import { defaultFieldResolver, GraphQLError } from 'graphql';

export const authDirective =
  (directiveName = 'auth') =>
  (schema) => {
    const typeMap = schema.getTypeMap();
    for (const type of Object.values(typeMap)) {
      if (!('getFields' in type)) continue;
      const fields = type.getFields();
      for (const field of Object.values(fields)) {
        const authDirective = field.astNode?.directives?.find((d) => d.name.value === directiveName);
        if (authDirective) {
          const { resolve = defaultFieldResolver } = field;
          field.resolve = async function (source, args, ctx, info) {
            if (!ctx.user) {
              throw new GraphQLError('Unauthorized: User not authenticated', {
                extensions: { code: 'UNAUTHENTICATED' },
              });
            }
            return resolve.call(this, source, args, ctx, info);
          };
        }
      }
    }
    return schema;
  };
```

**Usage:**

```graphql
type Query {
  me: User! @auth
}
```

---

## 🧩 2️⃣ Role-Based Directive — `@hasRole`

This directive ensures that the authenticated user has one of the required roles.

**Example:**

```ts
// src/common/auth/role.directive.ts
import { defaultFieldResolver, GraphQLError } from 'graphql';

export const roleDirective =
  (directiveName = 'hasRole') =>
  (schema) => {
    const typeMap = schema.getTypeMap();
    for (const type of Object.values(typeMap)) {
      if (!('getFields' in type)) continue;
      const fields = type.getFields();

      for (const field of Object.values(fields)) {
        const roleDirective = field.astNode?.directives?.find((d) => d.name.value === directiveName);
        if (roleDirective) {
          const rolesArg = roleDirective.arguments?.find((a) => a.name.value === 'roles');
          const allowedRoles = rolesArg?.value?.values?.map((v) => v.value) || [];

          const { resolve = defaultFieldResolver } = field;
          field.resolve = async function (source, args, ctx, info) {
            if (!ctx.user) throw new GraphQLError('Unauthenticated');
            if (!allowedRoles.includes(ctx.user.role)) {
              throw new GraphQLError('Forbidden: Insufficient role', {
                extensions: { code: 'FORBIDDEN' },
              });
            }
            return resolve.call(this, source, args, ctx, info);
          };
        }
      }
    }
    return schema;
  };
```

**Usage:**

```graphql
type Mutation {
  createDoctor(data: DoctorInput!): Doctor! @auth @hasRole(roles: ["CLINIC_ADMIN"])
}
```

---

## 🧠 3️⃣ Fine-Grained Permission Directive — `@hasPermission`

This directive checks for **specific permissions** (e.g., `"appointment:create"`, `"patient:update"`).  
Permissions can be stored in the user object or fetched dynamically from the database or a policy engine.

**Example:**

```ts
// src/common/auth/permission.directive.ts
import { defaultFieldResolver, GraphQLError } from 'graphql';

export const permissionDirective =
  (directiveName = 'hasPermission') =>
  (schema) => {
    const typeMap = schema.getTypeMap();
    for (const type of Object.values(typeMap)) {
      if (!('getFields' in type)) continue;
      const fields = type.getFields();

      for (const field of Object.values(fields)) {
        const directive = field.astNode?.directives?.find((d) => d.name.value === directiveName);
        if (directive) {
          const permissionArg = directive.arguments?.find((a) => a.name.value === 'permission');
          const requiredPermission = permissionArg?.value?.value;

          const { resolve = defaultFieldResolver } = field;
          field.resolve = async function (source, args, ctx, info) {
            if (!ctx.user) throw new GraphQLError('Unauthenticated');

            const userPermissions = ctx.user.permissions || [];
            if (!userPermissions.includes(requiredPermission)) {
              throw new GraphQLError('Forbidden: Missing permission', {
                extensions: { code: 'FORBIDDEN', requiredPermission },
              });
            }

            return resolve.call(this, source, args, ctx, info);
          };
        }
      }
    }
    return schema;
  };
```

**Usage:**

```graphql
type Mutation {
  cancelAppointment(id: ID!): Appointment! @auth @hasPermission(permission: "appointment:cancel")
}
```

---

## 🧩 4️⃣ Integrating Directives with Apollo Server

To activate your directives, wrap your schema with them before passing it to Apollo Server.

**Example — `schema.ts`:**

```ts
import { makeExecutableSchema } from '@graphql-tools/schema';
import { authDirective } from '../common/auth/auth.directive';
import { roleDirective } from '../common/auth/role.directive';
import { permissionDirective } from '../common/auth/permission.directive';
import typeDefs from './typeDefs';
import resolvers from './resolvers';

let schema = makeExecutableSchema({ typeDefs, resolvers });

schema = authDirective('auth')(schema);
schema = roleDirective('hasRole')(schema);
schema = permissionDirective('hasPermission')(schema);

export default schema;
```

---

## 🔑 5️⃣ Context and User Object

The `ctx.user` object is injected from your authentication middleware.  
It typically looks like this:

```ts
export interface AuthUser {
  id: string;
  email: string;
  role: 'CLINIC_ADMIN' | 'DOCTOR' | 'ASSISTANT' | 'PATIENT';
  clinicId: string;
  permissions: string[]; // e.g. ["appointment:create", "appointment:cancel"]
}
```

**Example middleware (`auth.middleware.ts`):**

```ts
import jwt from 'jsonwebtoken';

export async function verifyToken(authHeader: string) {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
```

---

## 🧠 Example Usage in GraphQL Schema

```graphql
type Mutation {
  createAppointment(data: AppointmentInput!): Appointment! @auth @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"]) @hasPermission(permission: "appointment:create")

  cancelAppointment(id: ID!): Appointment! @auth @hasPermission(permission: "appointment:cancel")

  updatePatient(id: ID!, data: PatientInput!): Patient! @auth @hasPermission(permission: "patient:update")
}
```

---

## ✅ Benefits of Directive-Based Authorization

| Benefit         | Description                                               |
| --------------- | --------------------------------------------------------- |
| 🧩 Declarative  | Security logic lives in the schema, not in code.          |
| 🔁 Reusable     | One implementation works across all resolvers.            |
| 🧠 Maintainable | Easier to audit and update permissions.                   |
| 🛡️ Centralized  | Auth logic lives in one place, not scattered.             |
| ⚙️ Flexible     | Combine `@auth`, `@hasRole`, and `@hasPermission` freely. |

---

## 📁 Summary Template

```
src/
  common/
    auth/
      auth.directive.ts
      role.directive.ts
      permission.directive.ts
      auth.utils.ts
  graphql/
    schema.ts         → wrap schema with directives
    resolvers.ts
    typeDefs.ts
```

---

## 🧩 Developer Guidelines

- ✅ Always use `@auth` for protected resolvers.
- ✅ Add `@hasPermission` to every sensitive operation.
- ✅ Avoid hardcoding roles inside resolvers.
- ✅ Define all permissions centrally (e.g. `permissions.ts`).
- ✅ Maintain mapping between roles ↔ permissions for easier management.

---

**File Purpose:**  
This document defines the **GraphQL authorization system** using schema directives with **fine-grained permissions**.  
It enables clean, declarative, and scalable access control across all GraphQL modules.
