import { gql } from '@apollo/client';

export const CREATE_CLINIC = gql`
  mutation CreateClinic($input: CreateClinicInput!) {
    createClinic(input: $input) {
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
`;
