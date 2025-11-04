import gql from 'graphql-tag';

export default gql`
  # Types
  type AuditLog {
    id: ID!
    clinicId: ID!
    actorId: ID
    action: String!
    entity: String!
    entityId: String!
    metadata: JSON
    ipAddress: String
    userAgent: String
    createdAt: DateTime!
    appointmentId: ID

    # Relations
    clinic: Clinic!
    actor: User
    appointment: Appointment
  }

  # Inputs
  input AuditLogFilterInput {
    actorId: ID
    entity: String
    action: String
    entityId: ID
    startDate: DateTime
    endDate: DateTime
    appointmentId: ID
  }

  input CreateAuditLogInput {
    action: String!
    entity: String!
    entityId: String!
    metadata: JSON
    ipAddress: String
    userAgent: String
    appointmentId: ID
  }

  # Queries
  type Query {
    auditLogs(filter: AuditLogFilterInput, limit: Int, offset: Int): [AuditLog!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])

    auditLog(id: ID!): AuditLog
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])

    auditLogsByEntity(entity: String!, entityId: ID!): [AuditLog!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])

    auditLogsByActor(actorId: ID!, limit: Int, offset: Int): [AuditLog!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])

    auditLogsByAppointment(appointmentId: ID!): [AuditLog!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR", "ASSISTANT"])

    auditLogsCount(filter: AuditLogFilterInput): Int!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
  }

  # Mutations
  type Mutation {
    createAuditLog(data: CreateAuditLogInput!): AuditLog!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "auditLog:create")

    deleteAuditLog(id: ID!): AuditLog!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "auditLog:delete")

    deleteAuditLogsByEntity(entity: String!, entityId: ID!): Int!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "auditLog:delete")
  }
`;
