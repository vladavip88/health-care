import { gql } from '@apollo/client';

export const CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      id
      email
      firstName
      lastName
      role
      clinicId
      clinic {
        id
        name
        legalName
        email
        phone
        address
        city
        country
        timezone
        website
        createdAt
        updatedAt
      }
    }
  }
`;
