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
  Authentication response with user and tokens
  """
  type AuthResponse {
    user: AuthUser!
    tokens: AuthTokens!
  }

  """
  Registration input
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
  Login input
  """
  input LoginInput {
    email: String!
    password: String!
  }

  extend type Mutation {
    """
    Register a new user
    Public mutation - no authentication required
    Password must be at least 8 characters long
    """
    register(input: RegisterInput!): AuthResponse!

    """
    Login with email and password
    Public mutation - no authentication required
    Returns access token (short-lived) and refresh token (long-lived)
    """
    login(input: LoginInput!): AuthResponse!

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
