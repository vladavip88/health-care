import gql from 'graphql-tag';
import { userSchema } from '../modules/user/user.schema';
import { authSchema } from '../modules/auth/auth.schema';

/**
 * Root schema with base Query and Mutation types
 * Individual modules extend these base types
 */
const baseSchema = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

/**
 * Combined type definitions
 * Includes base schema and all module schemas
 */
export const typeDefs = [baseSchema, userSchema, authSchema];
