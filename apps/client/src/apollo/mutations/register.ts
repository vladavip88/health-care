import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        email
        firstName
        lastName
        role
        clinicId
      }
      tokens {
        accessToken
        refreshToken
      }
    }
  }
`;
