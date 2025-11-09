import { useMutation } from '@apollo/client/react';
import { LOGOUT } from '../mutations/logout';

interface LogoutResponse {
  logout: boolean;
}

export const useLogout = () => {
  const [logoutMutation, { loading }] = useMutation<LogoutResponse>(LOGOUT);

  const logout = async (refreshToken: string) => {
    try {
      await logoutMutation({
        variables: { refreshToken },
      });
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, we still want to clear local storage
      return false;
    }
  };

  return {
    logout,
    loading,
  };
};
