import gql from 'graphql-tag';

export default gql`
  type WeeklySlot {
    id: ID!
    doctorId: ID!
    weekday: Int!
    startTime: String!
    endTime: String!
    durationMin: Int
    active: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    doctor: Doctor!
  }

  input CreateWeeklySlotInput {
    doctorId: ID!
    weekday: Int!
    startTime: String!
    endTime: String!
    durationMin: Int
    active: Boolean
  }

  input UpdateWeeklySlotInput {
    weekday: Int
    startTime: String
    endTime: String
    durationMin: Int
    active: Boolean
  }

  input BulkCreateWeeklySlotInput {
    doctorId: ID!
    slots: [WeeklySlotDataInput!]!
  }

  input WeeklySlotDataInput {
    weekday: Int!
    startTime: String!
    endTime: String!
    durationMin: Int
    active: Boolean
  }

  type Query {
    weeklySlots(doctorId: ID!): [WeeklySlot!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR", "ASSISTANT"])

    weeklySlot(id: ID!): WeeklySlot
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR", "ASSISTANT"])

    myWeeklySlots: [WeeklySlot!]! @auth @hasRole(roles: ["DOCTOR"])

    activeWeeklySlots(doctorId: ID!): [WeeklySlot!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR", "ASSISTANT"])
  }

  type Mutation {
    createWeeklySlot(data: CreateWeeklySlotInput!): WeeklySlot!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR"])
      @hasPermission(permission: "weeklySlot:create")

    bulkCreateWeeklySlots(data: BulkCreateWeeklySlotInput!): [WeeklySlot!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR"])
      @hasPermission(permission: "weeklySlot:create")

    updateWeeklySlot(id: ID!, data: UpdateWeeklySlotInput!): WeeklySlot!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR"])
      @hasPermission(permission: "weeklySlot:update")

    deleteWeeklySlot(id: ID!): WeeklySlot!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR"])
      @hasPermission(permission: "weeklySlot:delete")

    activateWeeklySlot(id: ID!): WeeklySlot!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR"])
      @hasPermission(permission: "weeklySlot:update")

    deactivateWeeklySlot(id: ID!): WeeklySlot!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR"])
      @hasPermission(permission: "weeklySlot:update")
  }
`;
