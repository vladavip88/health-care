import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { GET_PATIENTS } from '../queries/getPatients';
import type { GetPatientsQuery, GetPatientsQueryVariables } from '../../generated/graphql';

export const usePatients = (skip: number = 0, take: number = 20) => {
  const { data, loading, error, refetch } = useQuery<GetPatientsQuery, GetPatientsQueryVariables>(
    GET_PATIENTS,
    {
      variables: {
        pagination: { skip, take },
      },
    }
  );

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
    patients: data?.patients?.items ?? [],
    total: data?.patients?.total ?? 0,
    hasMore: data?.patients?.hasMore ?? false,
    skip: data?.patients?.skip ?? 0,
    take: data?.patients?.take ?? 20,
    loading,
    refetch,
  };
};
