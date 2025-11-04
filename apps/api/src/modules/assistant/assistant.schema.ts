import gql from 'graphql-tag';

export default gql`
  type Assistant {
    id: ID!
    userId: ID!
    clinicId: ID!
    title: String
    permissions: [String!]!
    active: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    user: User!
    clinic: Clinic!
  }

  input CreateAssistantInput {
    userId: ID!
    title: String
    permissions: [String!]
    active: Boolean
  }

  input UpdateAssistantInput {
    title: String
    permissions: [String!]
    active: Boolean
  }

  type Query {
    assistants: [Assistant!]! @auth @hasRole(roles: ["CLINIC_ADMIN"])
    assistant(id: ID!): Assistant @auth @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])
    myAssistantProfile: Assistant @auth @hasRole(roles: ["ASSISTANT"])
  }

  type Mutation {
    createAssistant(data: CreateAssistantInput!): Assistant!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "assistant:create")

    updateAssistant(id: ID!, data: UpdateAssistantInput!): Assistant!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])
      @hasPermission(permission: "assistant:update")

    deleteAssistant(id: ID!): Assistant!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "assistant:delete")

    deactivateAssistant(id: ID!): Assistant!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "assistant:update")

    activateAssistant(id: ID!): Assistant!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "assistant:update")
  }
`;
