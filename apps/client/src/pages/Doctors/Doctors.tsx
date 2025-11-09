import { Container, Title, Text, Paper } from '@mantine/core';

export function Doctors() {
  return (
    <Container size="xl">
      <Title order={1} mb="md">
        Doctors
      </Title>
      <Paper shadow="sm" p="md" withBorder>
        <Text>Doctors page content coming soon...</Text>
      </Paper>
    </Container>
  );
}

export default Doctors;
