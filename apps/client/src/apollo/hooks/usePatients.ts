import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { GET_PATIENTS } from '../queries/getPatients';

export const usePatients = () => {
  const { data, loading, error, refetch } = useQuery(GET_PATIENTS);

  useEffect(() => {
    if (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load patients.',
        color: 'red',
      });
    }
  }, [error]);

  return {
    patients: data?.patients ?? [],
    loading,
    refetch,
  };
};
