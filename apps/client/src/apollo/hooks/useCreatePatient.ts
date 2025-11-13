import { useMutation } from '@apollo/client/react';
import { notifications } from '@mantine/notifications';
import { CREATE_PATIENT } from '../mutations/createPatient';
import { GET_PATIENTS } from '../queries/getPatients';
import type { CreatePatientMutation, CreatePatientMutationVariables } from '../../generated/graphql';

export function useCreatePatient() {
  const [createPatientMutation, { loading }] = useMutation<
    CreatePatientMutation,
    CreatePatientMutationVariables
  >(CREATE_PATIENT, {
    refetchQueries: [
      {
        query: GET_PATIENTS,
        variables: {
          pagination: { skip: 0, take: 20 },
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  const createPatient = async (data: CreatePatientMutationVariables['data']) => {
    try {
      const response = await createPatientMutation({
        variables: {
          data,
        },
      });

      if (response.data?.createPatient) {
        notifications.show({
          title: 'Success',
          message: 'Patient created successfully',
          color: 'green',
          autoClose: 3000,
        });

        return response.data.createPatient;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create patient';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
        autoClose: 3000,
      });
      throw error;
    }
  };

  return { createPatient, loading };
}
