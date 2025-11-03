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
    users: [User!]!
    user(id: ID!): User
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
    ): User!

    updateUser(
      id: ID!
      firstName: String
      lastName: String
      phone: String
      active: Boolean
    ): User!

    deleteUser(id: ID!): User!
  }
`;
