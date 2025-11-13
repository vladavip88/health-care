import { useMutation } from '@apollo/client/react';
import { notifications } from '@mantine/notifications';
import { REGISTER_COMPANY } from '../mutations/registerCompany';

interface RegisterCompanyInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  clinicName: string;
}

interface RegisterCompanyResponse {
  registerCompany: {
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
  const [registerCompanyMutation, { loading }] = useMutation<RegisterCompanyResponse>(
    REGISTER_COMPANY
  );

  const register = async (input: RegisterCompanyInput) => {
    try {
      const response = await registerCompanyMutation({
        variables: {
          input: {
            clinicName: input.clinicName,
            email: input.email,
            password: input.password,
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
          },
        },
      });

      if (response.data) {
        const { tokens, user } = response.data.registerCompany;

        // Store tokens in localStorage
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        notifications.show({
          title: 'Success',
          message: 'Clinic and account created successfully!',
          color: 'green',
        });
        return response.data.registerCompany;
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
