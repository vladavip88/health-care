import { useMutation } from '@apollo/client/react';
import { notifications } from '@mantine/notifications';
import { REGISTER } from '../mutations/register';
import { CREATE_CLINIC } from '../mutations/createClinic';

interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  clinicName: string;
  role: string;
}

interface ClinicResponse {
  createClinic: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface AuthResponse {
  register: {
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: string;
      clinicId: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export const useRegister = () => {
  const [createClinicMutation] = useMutation<ClinicResponse>(CREATE_CLINIC);
  const [registerMutation, { loading }] = useMutation<AuthResponse>(REGISTER);

  const register = async (input: RegisterInput) => {
    try {
      // Step 1: Create clinic first
      const clinicResponse = await createClinicMutation({
        variables: {
          input: {
            name: input.clinicName,
          },
        },
      });

      if (!clinicResponse.data) {
        throw new Error('Failed to create clinic');
      }

      const clinicId = clinicResponse.data.createClinic.id;
      const clinic = clinicResponse.data.createClinic;

      // Step 2: Register user with the created clinic ID
      const registerResponse = await registerMutation({
        variables: {
          input: {
            email: input.email,
            password: input.password,
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            role: input.role,
            clinicId,
          },
        },
      });

      if (registerResponse.data) {
        const { tokens, user } = registerResponse.data.register;

        // Store only tokens in localStorage
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        notifications.show({
          title: 'Success',
          message: 'Clinic and account created successfully!',
          color: 'green',
        });
        return registerResponse.data.register;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed. Please try again.';
      notifications.show({
        title: 'Registration Error',
        message: errorMessage,
        color: 'red',
      });
      throw error;
    }
    return null;
  };

  return {
    register,
    loading,
  };
};
