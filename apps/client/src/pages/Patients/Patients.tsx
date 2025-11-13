import { useState } from 'react';
import {
  Container,
  Title,
  Button,
  Group,
  Table,
  Paper,
  Text,
  Pagination,
  Stack,
  Skeleton,
  Center,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconPlus } from '@tabler/icons-react';
import { usePatients } from '../../apollo/hooks/usePatients';

const ITEMS_PER_PAGE = 20;

export function Patients() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const { patients, total, loading } = usePatients(skip, ITEMS_PER_PAGE);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Container size="xl">
      <Group justify="space-between" align="center" mb="lg">
        <Title order={1}>Patients</Title>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => navigate('/patients/create')}
        >
          Create Patient
        </Button>
      </Group>

      <Paper shadow="sm" p="md" withBorder>
        {loading ? (
          <Stack gap="md">
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
          </Stack>
        ) : patients.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed">No patients found</Text>
          </Center>
        ) : (
          <>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Gender</Table.Th>
                  <Table.Th>Date of Birth</Table.Th>
                  <Table.Th>Created</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {patients.map((patient) => (
                  <Table.Tr key={patient.id}>
                    <Table.Td>
                      {patient.firstName} {patient.lastName}
                    </Table.Td>
                    <Table.Td>{patient.email || '-'}</Table.Td>
                    <Table.Td>{patient.phone || '-'}</Table.Td>
                    <Table.Td>{patient.gender || '-'}</Table.Td>
                    <Table.Td>{formatDate(patient.dob)}</Table.Td>
                    <Table.Td>{formatDate(patient.createdAt)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {totalPages > 1 && (
              <Group justify="center" mt="lg">
                <Pagination
                  value={page}
                  onChange={setPage}
                  total={totalPages}
                  withEdges
                />
              </Group>
            )}

            <Text size="sm" c="dimmed" mt="md" ta="center">
              Showing {skip + 1} to {Math.min(skip + ITEMS_PER_PAGE, total)} of {total} patients
            </Text>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default Patients;
