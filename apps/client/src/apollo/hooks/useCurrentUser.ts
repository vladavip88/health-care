import { useQuery } from '@apollo/client/react';
import { CURRENT_USER } from '../queries/currentUser';

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

interface CurrentUserResponse {
  currentUser: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    clinicId: string;
    clinic: Clinic;
  };
}

export const useCurrentUser = () => {
  const { data, loading, error, refetch } = useQuery<CurrentUserResponse>(
    CURRENT_USER,
    {
      // Don't cache - always fetch fresh from server
      fetchPolicy: 'network-only',
    }
  );

  return {
    user: data?.currentUser,
    clinic: data?.currentUser?.clinic,
    loading,
    error,
    refetch,
  };
};
