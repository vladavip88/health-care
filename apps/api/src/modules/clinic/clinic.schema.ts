import gql from 'graphql-tag';

/**
 * Clinic GraphQL Schema
 * Type definitions for clinic-related operations
 */
export const clinicSchema = gql`
  """
  Clinic entity representing a medical facility
  """
  type Clinic {
    id: ID!
    name: String!
    legalName: String
    email: String
    phone: String
    address: String
    city: String
    country: String
    timezone: String!
    subscriptionPlan: String
    subscriptionStatus: String
    subscriptionUntil: String
    website: String
    logoUrl: String
    createdAt: String!
    updatedAt: String!
  }

  """
  Clinic with count statistics
  """
  type ClinicWithStats {
    id: ID!
    name: String!
    legalName: String
    email: String
    phone: String
    address: String
    city: String
    country: String
    timezone: String!
    subscriptionPlan: String
    subscriptionStatus: String
    subscriptionUntil: String
    website: String
    logoUrl: String
    createdAt: String!
    updatedAt: String!
    _count: ClinicCount
  }

  """
  Count of related entities in a clinic
  """
  type ClinicCount {
    users: Int!
    doctors: Int!
    assistants: Int!
    patients: Int!
    appointments: Int!
  }

  """
  Clinic statistics
  """
  type ClinicStats {
    users: Int!
    doctors: Int!
    assistants: Int!
    patients: Int!
    appointments: Int!
  }

  """
  Input for creating a new clinic
  """
  input CreateClinicInput {
    name: String!
    legalName: String
    email: String
    phone: String
    address: String
    city: String
    country: String
    timezone: String
    subscriptionPlan: String
    subscriptionStatus: String
    subscriptionUntil: String
    website: String
    logoUrl: String
  }

  """
  Input for updating clinic settings
  """
  input UpdateClinicInput {
    id: ID!
    name: String
    legalName: String
    email: String
    phone: String
    address: String
    city: String
    country: String
    timezone: String
    website: String
    logoUrl: String
  }

  """
  Input for updating clinic subscription
  """
  input UpdateClinicSubscriptionInput {
    id: ID!
    plan: String!
    status: String!
    until: String
  }

  extend type Query {
    """
    Get a clinic by ID
    Users can only access their own clinic
    Requires authentication
    """
    clinic(id: ID!): Clinic

    """
    Get current user's clinic with statistics
    Requires authentication
    """
    myClinic: ClinicWithStats

    """
    Get clinic statistics
    Only CLINIC_ADMIN can view
    Requires CLINIC_READ permission
    """
    clinicStats: ClinicStats

    """
    Get all clinics (restricted)
    Returns only user's clinic for now
    Requires CLINIC_READ permission
    """
    clinics: [Clinic!]!
  }

  extend type Mutation {
    """
    Create a new clinic (restricted)
    Currently disabled - clinics created during onboarding
    """
    createClinic(input: CreateClinicInput!): Clinic!

    """
    Update clinic settings
    Only CLINIC_ADMIN can update their own clinic
    Requires CLINIC_UPDATE permission
    """
    updateClinic(input: UpdateClinicInput!): Clinic!

    """
    Update clinic subscription
    Only CLINIC_ADMIN can update subscription
    Requires CLINIC_SETTINGS permission
    """
    updateClinicSubscription(input: UpdateClinicSubscriptionInput!): Clinic!

    """
    Delete clinic (restricted)
    Currently disabled - contact platform support
    """
    deleteClinic(id: ID!): Clinic!
  }
`;
