import { useMutation } from '@apollo/client/react';
import { notifications } from '@mantine/notifications';
import { gql } from '@apollo/client';

interface LoginInput {
  email: string;
  password: string;
}

interface Clinic {
  id: string;
  name: string;
}

interface LoginResponse {
  login: {
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: string;
      clinicId: string;
    };
    clinics: Clinic[];
  };
}

const LOGIN = gql`
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

export const useLogin = () => {
  const [loginMutation, { loading }] = useMutation<LoginResponse>(LOGIN);

  const login = async (input: LoginInput) => {
    try {
      const response = await loginMutation({
        variables: { input },
      });

      if (response?.data?.login) {
        const { user, clinics } = response.data.login;

        // Don't store tokens yet - wait for clinic selection if multiple clinics
        notifications.show({
          title: 'Login Successful',
          message: clinics.length > 1
            ? 'Select your clinic to continue.'
            : 'Logging you in...',
          color: 'green',
        });
        return {
          user,
          clinics,
        };
      }
      throw new Error('Invalid login response');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed. Please try again.';
      notifications.show({
        title: 'Login Error',
        message: errorMessage,
        color: 'red',
      });
      throw error;
    }
  };

  return {
    login,
    loading,
  };
};
