import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        firstName
        lastName
        role
        clinicId
      }
      clinics {
        id
        name
      }
    }
  }
`;
