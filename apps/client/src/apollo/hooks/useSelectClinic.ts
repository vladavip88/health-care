import { useMutation, useApolloClient } from '@apollo/client/react';
import { notifications } from '@mantine/notifications';
import { gql } from '@apollo/client';
import { useCurrentUser } from './useCurrentUser';

interface SelectClinicInput {
  email: string;
  password: string;
  clinicId: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  clinicId: string;
}

interface SelectClinicResponse {
  selectClinic: {
    user: AuthUser;
    tokens: AuthTokens;
  };
}

const SELECT_CLINIC = gql`
  mutation SelectClinic($email: String!, $password: String!, $clinicId: String!) {
    selectClinic(email: $email, password: $password, clinicId: $clinicId) {
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

export const useSelectClinic = () => {
  const apolloClient = useApolloClient();
  const { refetch: refetchCurrentUser } = useCurrentUser();
  const [selectClinicMutation, { loading }] = useMutation<SelectClinicResponse>(SELECT_CLINIC);

  const selectClinic = async (input: SelectClinicInput) => {
    try {
      const response = await selectClinicMutation({
        variables: input,
      });

      if (response?.data?.selectClinic) {
        const { tokens } = response.data.selectClinic;

        // Store tokens in localStorage
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        // Clear Apollo cache to force fresh data fetch with new auth token
        apolloClient.cache.reset();

        // Refetch current user with new auth token
        // Note: This may throw AbortError if cache reset interrupts the query, which is harmless
        try {
          await refetchCurrentUser();
        } catch (refetchError) {
          // Ignore abort errors from cache reset - they're expected and harmless
          if (!(refetchError instanceof Error && refetchError.name === 'AbortError')) {
            throw refetchError;
          }
        }

        notifications.show({
          title: 'Success',
          message: 'Login successful!',
          color: 'green',
        });
        return response.data.selectClinic;
      }
      throw new Error('Invalid clinic selection response');
    } catch (error) {
      // Ignore AbortError from cache reset - it's expected during auth flow
      if (error instanceof Error && error.name === 'AbortError') {
        throw error; // Re-throw to be handled by ClinicSelection component
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Clinic selection failed. Please try again.';
      notifications.show({
        title: 'Selection Error',
        message: errorMessage,
        color: 'red',
      });
      throw error;
    }
  };

  return {
    selectClinic,
    loading,
  };
};
