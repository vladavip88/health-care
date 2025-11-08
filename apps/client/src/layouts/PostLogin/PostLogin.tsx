import { Outlet } from 'react-router-dom';
import { AppShell, Header, Group, Title, Button, Container, Text, Avatar, Menu } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useAuth } from '../../auth/useAuth';
import styles from './PostLogin.module.scss';

export function PostLogin() {
  // Get user and clinic from auth context
  const { user, clinic, logout } = useAuth();

  return (
    <AppShell
      header={{ height: 70 }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#f5f5f5',
        },
      }}
    >
      <AppShell.Header p="md">
        <Group justify="space-between" align="center" style={{ height: '100%' }}>
          <Title order={2} className={styles.logo}>
            Healthcare App
          </Title>

          <Group gap="md">
            {user && clinic && (
              <div className={styles.clinicInfo}>
                <Text size="sm" fw={500}>
                  {clinic.name}
                </Text>
              </div>
            )}

            {user && (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Group gap="xs" style={{ cursor: 'pointer' }}>
                    <Avatar name={user.email} color="blue" radius="xl" />
                    <div>
                      <Text size="sm" fw={500}>
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {user.email}
                      </Text>
                    </div>
                  </Group>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconLogout size={14} />}
                    onClick={logout}
                    color="red"
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="md">
          <Outlet context={{ user, clinic }} />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default PostLogin;
