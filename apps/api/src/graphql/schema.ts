import gql from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    phone: String
    role: Role!
    active: Boolean!
    emailVerified: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  enum Role {
    CLINIC_ADMIN
    DOCTOR
    ASSISTANT
    PATIENT
  }

  type Query {
    users: [User!]! @auth @hasRole(roles: ["CLINIC_ADMIN"])
    user(id: ID!): User @auth
  }

  type Mutation {
    createUser(
      email: String!
      passwordHash: String!
      firstName: String
      lastName: String
      phone: String
      role: Role!
      clinicId: String!
    ): User! @auth @hasRole(roles: ["CLINIC_ADMIN"])

    updateUser(
      id: ID!
      firstName: String
      lastName: String
      phone: String
      active: Boolean
    ): User! @auth @hasRole(roles: ["CLINIC_ADMIN"])

    deleteUser(id: ID!): User! @auth @hasRole(roles: ["CLINIC_ADMIN"])
  }
`;
