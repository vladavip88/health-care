import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Group,
  Button,
  Text,
  Stack,
  List,
  ThemeIcon,
  Paper,
  Card,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useSelectClinic } from '../../apollo/hooks/useSelectClinic';

interface Clinic {
  id: string;
  name: string;
}

interface LocationState {
  loginData: {
    email: string;
    password: string;
  };
  clinics: Clinic[];
}

export function ClinicSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectClinic, loading } = useSelectClinic();

  const state = location.state as LocationState | null;

  // Debug log to see what state we're getting
  console.log('ClinicSelection state:', state);

  if (!state || !state.clinics || state.clinics.length === 0) {
    return (
      <Container size="sm">
        <Paper p="lg" radius="md" withBorder shadow="sm">
          <Title order={3} ta="center" mb="md">
            Error
          </Title>
          <Text c="red">
            No clinics available. Please try logging in again.
            {state
              ? ` (clinics: ${state.clinics?.length || 0})`
              : ' (no state)'}
          </Text>
          <Button onClick={() => navigate('/login')} mt="md" fullWidth>
            Back to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleClinicSelect = async (clinicId: string) => {
    try {
      console.log('Selecting clinic:', clinicId);
      const response = await selectClinic({
        email: state.loginData.email,
        password: state.loginData.password,
        clinicId,
      });

      console.log('Clinic selection response:', response);
      if (response) {
        console.log('Navigating to dashboard');
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      // Ignore AbortError from cache reset during auth flow - it's expected and harmless
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(
          'Cache reset occurred during login - proceeding with navigation'
        );
        navigate('/dashboard', { replace: true });
      } else {
        console.error('Clinic selection error:', error);
      }
    }
  };

  return (
    <Container size="sm">
      <Paper p="lg" radius="md" withBorder shadow="sm">
        <Title order={3} ta="center" mb="md">
          Select Your Clinic
        </Title>
        <Text c="dimmed" mb="lg">
          You have access to multiple clinics. Please select one to continue.
        </Text>

        <Stack gap="md" mb="lg">
          <Card withBorder radius="md" p="md">
            <List spacing="md">
              {state.clinics.map((clinic) => (
                <List.Item
                  key={clinic.id}
                  icon={
                    <ThemeIcon color="blue" size={32} radius="md">
                      <IconCheck size={16} />
                    </ThemeIcon>
                  }
                >
                  <Group justify="space-between" align="center" w="100%">
                    <div>
                      <Text fw={500}>{clinic.name}</Text>
                      <Text size="sm" c="dimmed">
                        Click to select this clinic
                      </Text>
                    </div>
                    <Button
                      onClick={() => handleClinicSelect(clinic.id)}
                      loading={loading}
                      disabled={loading}
                      size="sm"
                    >
                      Select
                    </Button>
                  </Group>
                </List.Item>
              ))}
            </List>
          </Card>
        </Stack>

        <Group justify="center">
          <Button variant="subtle" onClick={() => navigate('/login')}>
            Back to Login
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}

export default ClinicSelection;
