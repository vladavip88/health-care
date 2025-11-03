import gql from 'graphql-tag';

/**
 * GraphQL directive type definitions
 * These define the directives that can be used in the schema
 */
export const directiveTypeDefs = gql`
  directive @auth on FIELD_DEFINITION
  directive @hasRole(roles: [String!]!) on FIELD_DEFINITION
  directive @hasPermission(permission: String!) on FIELD_DEFINITION
`;
