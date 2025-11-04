import gql from 'graphql-tag';

export default gql`
  # Types
  type WebhookEndpoint {
    id: ID!
    clinicId: ID!
    url: String!
    secret: String!
    active: Boolean!
    description: String
    events: [String!]!
    lastSuccessAt: DateTime
    lastFailureAt: DateTime
    failureCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    clinic: Clinic!
  }

  # Inputs
  input CreateWebhookEndpointInput {
    url: String!
    secret: String!
    active: Boolean
    description: String
    events: [String!]!
  }

  input UpdateWebhookEndpointInput {
    url: String
    secret: String
    active: Boolean
    description: String
    events: [String!]
  }

  input WebhookEndpointFilterInput {
    active: Boolean
    event: String
  }

  # Queries
  type Query {
    webhookEndpoints(filter: WebhookEndpointFilterInput): [WebhookEndpoint!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])

    webhookEndpoint(id: ID!): WebhookEndpoint
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])

    activeWebhookEndpoints: [WebhookEndpoint!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
  }

  # Mutations
  type Mutation {
    createWebhookEndpoint(data: CreateWebhookEndpointInput!): WebhookEndpoint!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "webhook:create")

    updateWebhookEndpoint(id: ID!, data: UpdateWebhookEndpointInput!): WebhookEndpoint!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "webhook:update")

    deleteWebhookEndpoint(id: ID!): WebhookEndpoint!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "webhook:delete")

    activateWebhookEndpoint(id: ID!): WebhookEndpoint!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "webhook:update")

    deactivateWebhookEndpoint(id: ID!): WebhookEndpoint!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "webhook:update")

    testWebhookEndpoint(id: ID!): Boolean!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "webhook:test")

    resetWebhookFailureCount(id: ID!): WebhookEndpoint!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "webhook:update")
  }
`;
