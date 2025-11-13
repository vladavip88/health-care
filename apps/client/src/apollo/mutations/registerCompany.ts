import { gql } from '@apollo/client';

export const REGISTER_COMPANY = gql`
  mutation RegisterCompany($input: RegisterCompanyInput!) {
    registerCompany(input: $input) {
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
