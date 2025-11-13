import { gql } from '@apollo/client';

export const CREATE_PATIENT = gql`
  mutation CreatePatient($data: CreatePatientInput!) {
    createPatient(data: $data) {
      id
      firstName
      lastName
      email
      phone
      dob
      gender
      address
      city
      country
      notes
      createdAt
      updatedAt
    }
  }
`;
