import gql from 'graphql-tag';

/**
 * Auth GraphQL Schema
 * Type definitions for authentication operations
 */
export const authSchema = gql`
  """
  Authentication tokens returned on login/register
  """
  type AuthTokens {
    accessToken: String!
    refreshToken: String!
  }

  """
  User data in auth response
  """
  type AuthUser {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    role: Role!
    clinicId: String!
  }

  """
  Clinic information returned in login response
  """
  type LoginClinicInfo {
    id: ID!
    name: String!
  }

  """
  Login response with user and list of available clinics
  """
  type LoginResponse {
    user: AuthUser!
    clinics: [LoginClinicInfo!]!
  }

  """
  Authentication response with user and tokens
  """
  type AuthResponse {
    user: AuthUser!
    tokens: AuthTokens!
  }

  """
  Registration input (for registering in existing clinic)
  """
  input RegisterInput {
    email: String!
    password: String!
    firstName: String
    lastName: String
    phone: String
    role: Role!
    clinicId: String!
  }

  """
  Register company input (creates clinic + user in one step)
  """
  input RegisterCompanyInput {
    clinicName: String!
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phone: String!
  }

  """
  Login input
  """
  input LoginInput {
    email: String!
    password: String!
  }

  extend type Mutation {
    """
    Register a new company with admin user
    Public mutation - creates clinic and clinic admin user in one step
    No authentication required
    Password must be at least 8 characters long
    """
    registerCompany(input: RegisterCompanyInput!): AuthResponse!

    """
    Register a new user
    Public mutation - no authentication required
    Password must be at least 8 characters long
    """
    register(input: RegisterInput!): AuthResponse!

    """
    Login with email and password
    Public mutation - no authentication required
    Returns user and list of clinics where user has account
    """
    login(input: LoginInput!): LoginResponse!

    """
    Select clinic and finalize login
    Public mutation - no authentication required
    Returns access token (short-lived) and refresh token (long-lived)
    """
    selectClinic(email: String!, password: String!, clinicId: String!): AuthResponse!

    """
    Refresh access token using refresh token
    Public mutation - no authentication required
    Returns new token pair and invalidates old refresh token
    """
    refreshToken(refreshToken: String!): AuthTokens!

    """
    Logout user by invalidating refresh token
    Public mutation - can be called with or without authentication
    """
    logout(refreshToken: String!): Boolean!

    """
    Logout from all devices
    Requires authentication
    Invalidates all refresh tokens for the current user
    """
    logoutAll: Boolean!
  }
`;
