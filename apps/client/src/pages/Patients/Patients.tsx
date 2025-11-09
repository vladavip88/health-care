import { Container, Title, Text, Paper } from '@mantine/core';

export function Patients() {
  return (
    <Container size="xl">
      <Title order={1} mb="md">
        Patients
      </Title>
      <Paper shadow="sm" p="md" withBorder>
        <Text>Patients page content coming soon...</Text>
      </Paper>
    </Container>
  );
}

export default Patients;
