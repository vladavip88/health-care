import { gql } from '@apollo/client';

export const GET_PATIENTS = gql`
  query GetPatients($pagination: PaginationInput) {
    patients(pagination: $pagination) {
      items {
        id
        firstName
        lastName
        email
        phone
        dob
        gender
        createdAt
      }
      total
      skip
      take
      hasMore
    }
  }
`;
