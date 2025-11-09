import { Container, Title, Text, Paper } from '@mantine/core';

export function Appointments() {
  return (
    <Container size="xl">
      <Title order={1} mb="md">
        Appointments
      </Title>
      <Paper shadow="sm" p="md" withBorder>
        <Text>Appointments page content coming soon...</Text>
      </Paper>
    </Container>
  );
}

export default Appointments;
