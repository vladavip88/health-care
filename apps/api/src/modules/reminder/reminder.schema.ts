import gql from 'graphql-tag';

export default gql`
  # Enums
  enum ReminderStatus {
    SCHEDULED
    SENT
    FAILED
    SKIPPED
  }

  enum ReminderChannel {
    SMS
    EMAIL
  }

  # Types
  type ReminderRule {
    id: ID!
    clinicId: ID!
    offsetMin: Int!
    channel: ReminderChannel!
    active: Boolean!
    template: String
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    clinic: Clinic!
    reminders: [Reminder!]!
  }

  type Reminder {
    id: ID!
    appointmentId: ID!
    ruleId: ID
    channel: ReminderChannel!
    scheduledFor: DateTime!
    sentAt: DateTime
    status: ReminderStatus!
    error: String
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    appointment: Appointment!
    rule: ReminderRule
  }

  # Inputs
  input CreateReminderRuleInput {
    offsetMin: Int!
    channel: ReminderChannel!
    active: Boolean
    template: String
  }

  input UpdateReminderRuleInput {
    offsetMin: Int
    channel: ReminderChannel
    active: Boolean
    template: String
  }

  input ReminderFilterInput {
    appointmentId: ID
    status: ReminderStatus
    channel: ReminderChannel
    scheduledAfter: DateTime
    scheduledBefore: DateTime
  }

  # Queries
  type Query {
    # ReminderRule queries
    reminderRules: [ReminderRule!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])

    reminderRule(id: ID!): ReminderRule
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])

    activeReminderRules: [ReminderRule!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])

    # Reminder queries
    reminders(filter: ReminderFilterInput): [Reminder!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT", "DOCTOR"])

    reminder(id: ID!): Reminder
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT", "DOCTOR"])

    appointmentReminders(appointmentId: ID!): [Reminder!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT", "DOCTOR"])
  }

  # Mutations
  type Mutation {
    # ReminderRule mutations
    createReminderRule(data: CreateReminderRuleInput!): ReminderRule!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "reminderRule:create")

    updateReminderRule(id: ID!, data: UpdateReminderRuleInput!): ReminderRule!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "reminderRule:update")

    deleteReminderRule(id: ID!): ReminderRule!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "reminderRule:delete")

    activateReminderRule(id: ID!): ReminderRule!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "reminderRule:update")

    deactivateReminderRule(id: ID!): ReminderRule!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "reminderRule:update")

    # Reminder mutations
    generateRemindersForAppointment(appointmentId: ID!): [Reminder!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])
      @hasPermission(permission: "reminder:create")

    cancelReminder(id: ID!): Reminder!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])
      @hasPermission(permission: "reminder:update")

    markReminderSent(id: ID!): Reminder!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "reminder:update")

    markReminderFailed(id: ID!, error: String!): Reminder!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "reminder:update")
  }
`;
