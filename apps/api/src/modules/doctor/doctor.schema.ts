import gql from 'graphql-tag';

export default gql`
  type Doctor {
    id: ID!
    userId: ID!
    clinicId: ID!
    specialty: String
    title: String
    bio: String
    avatarUrl: String
    languages: [String!]!
    gcalCalendarId: String
    isAcceptingNewPatients: Boolean!
    timezone: String
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    user: User!
    clinic: Clinic!
    slots: [WeeklySlot!]!
    appointments: [Appointment!]!
  }

  input CreateDoctorInput {
    userId: ID!
    specialty: String
    title: String
    bio: String
    avatarUrl: String
    languages: [String!]
    gcalCalendarId: String
    isAcceptingNewPatients: Boolean
    timezone: String
  }

  input UpdateDoctorInput {
    specialty: String
    title: String
    bio: String
    avatarUrl: String
    languages: [String!]
    gcalCalendarId: String
    isAcceptingNewPatients: Boolean
    timezone: String
  }

  type Query {
    doctors: [Doctor!]! @auth @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])
    doctor(id: ID!): Doctor @auth @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT", "DOCTOR"])
    myDoctorProfile: Doctor @auth @hasRole(roles: ["DOCTOR"])
  }

  type Mutation {
    createDoctor(data: CreateDoctorInput!): Doctor!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "doctor:create")

    updateDoctor(id: ID!, data: UpdateDoctorInput!): Doctor!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR"])
      @hasPermission(permission: "doctor:update")

    deleteDoctor(id: ID!): Doctor!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "doctor:delete")
  }
`;
