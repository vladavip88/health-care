import gql from 'graphql-tag';

export default gql`
  type Patient {
    id: ID!
    clinicId: ID!
    userId: ID
    firstName: String!
    lastName: String!
    email: String
    phone: String
    dob: DateTime
    gender: String
    address: String
    city: String
    country: String
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    clinic: Clinic!
    user: User
    appointments: [Appointment!]!
  }

  input CreatePatientInput {
    userId: ID
    firstName: String!
    lastName: String!
    email: String
    phone: String
    dob: DateTime
    gender: String
    address: String
    city: String
    country: String
    notes: String
  }

  input UpdatePatientInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    dob: DateTime
    gender: String
    address: String
    city: String
    country: String
    notes: String
  }

  input PatientSearchInput {
    query: String
    email: String
    phone: String
  }

  type Query {
    patients(search: PatientSearchInput): [Patient!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR", "ASSISTANT"])

    patient(id: ID!): Patient
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR", "ASSISTANT", "PATIENT"])

    myPatientProfile: Patient @auth @hasRole(roles: ["PATIENT"])
  }

  type Mutation {
    createPatient(data: CreatePatientInput!): Patient!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])
      @hasPermission(permission: "patient:create")

    updatePatient(id: ID!, data: UpdatePatientInput!): Patient!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT", "PATIENT"])
      @hasPermission(permission: "patient:update")

    deletePatient(id: ID!): Patient!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "patient:delete")
  }
`;
