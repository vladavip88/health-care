import gql from 'graphql-tag';

/**
 * User GraphQL Schema
 * Type definitions for user-related operations
 */
export const userSchema = gql`
  type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    phone: String
    role: Role!
    active: Boolean!
    emailVerified: Boolean!
    lastLoginAt: String
    createdAt: String!
    updatedAt: String!
    clinicId: String!
    clinic: Clinic
    doctor: Doctor
    assistant: Assistant
    patient: Patient
  }

  enum Role {
    CLINIC_ADMIN
    DOCTOR
    ASSISTANT
    PATIENT
  }

  extend type Query {
    """
    Get the currently authenticated user
    Requires authentication only
    """
    currentUser: User
      @auth

    """
    Get a single user by ID
    Requires authentication and appropriate permissions
    """
    user(id: ID!): User
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR", "ASSISTANT"])
      @hasPermission(permission: "user:read")

    """
    Get all users in the clinic
    Supports filtering by role, active status, and search query
    Requires USER_READ permission
    """
    users(role: Role, active: Boolean, search: String): [User!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "user:read")

    """
    Search users by name or email
    Requires USER_READ permission
    """
    searchUsers(query: String!): [User!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])
      @hasPermission(permission: "user:read")
  }

  extend type Mutation {
    """
    Create a new user in the clinic
    Requires USER_CREATE permission
    Only CLINIC_ADMIN can create other admin users
    """
    createUser(
      email: String!
      passwordHash: String!
      firstName: String
      lastName: String
      phone: String
      role: Role!
      clinicId: String!
    ): User!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "user:create")

    """
    Update an existing user
    Users can update their own data or need USER_UPDATE permission
    Users cannot change their own active status
    """
    updateUser(
      id: ID!
      firstName: String
      lastName: String
      phone: String
      active: Boolean
    ): User!
      @auth
      @hasPermission(permission: "user:update")

    """
    Delete a user
    Requires USER_DELETE permission
    Users cannot delete themselves
    """
    deleteUser(id: ID!): User!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "user:delete")
  }
`;
