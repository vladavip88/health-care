import { useMutation } from '@apollo/client/react';
import { notifications } from '@mantine/notifications';
import { CREATE_CLINIC } from '../mutations/createClinic';

interface CreateClinicInput {
  name: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  website?: string;
}

interface Clinic {
  id: string;
  name: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateClinicResponse {
  createClinic: Clinic;
}

export const useCreateClinic = () => {
  const [createClinicMutation, { loading }] = useMutation<CreateClinicResponse>(CREATE_CLINIC);

  const createClinic = async (input: CreateClinicInput) => {
    try {
      const response = await createClinicMutation({
        variables: { input },
      });

      if (response.data) {
        const clinic = response.data.createClinic;

        // Store clinic info in localStorage
        localStorage.setItem('clinic', JSON.stringify(clinic));

        notifications.show({
          title: 'Success',
          message: `Clinic "${clinic.name}" created successfully!`,
          color: 'green',
        });
        return clinic;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create clinic. Please try again.';
      notifications.show({
        title: 'Creation Error',
        message: errorMessage,
        color: 'red',
      });
      throw error;
    }
    return null;
  };

  return {
    createClinic,
    loading,
  };
};
