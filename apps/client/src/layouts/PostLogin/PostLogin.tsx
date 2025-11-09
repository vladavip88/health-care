import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppShell,
  Group,
  Title,
  Text,
  Avatar,
  Menu,
  NavLink,
} from '@mantine/core';
import {
  IconLogout,
  IconDashboard,
  IconCalendar,
  IconStethoscope,
  IconUsers,
  IconNurse,
} from '@tabler/icons-react';
import { useAuth } from '../../auth/useAuth';
import styles from './PostLogin.module.scss';

export function PostLogin() {
  // Get user and clinic from auth context
  const { user, clinic, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: IconDashboard },
    { path: '/appointments', label: 'Appointments', icon: IconCalendar },
    { path: '/patients', label: 'Patients', icon: IconUsers },
    { path: '/doctors', label: 'Doctors', icon: IconStethoscope },
    { path: '/assistants', label: 'Assistants', icon: IconNurse },
  ];

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 250, breakpoint: 'sm' }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#f5f5f5',
        },
      }}
    >
      <AppShell.Header p="md">
        <Group
          justify="space-between"
          align="center"
          style={{ height: '100%' }}
        >
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

      <AppShell.Navbar p="md">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            label={item.label}
            leftSection={<item.icon size={20} stroke={1.5} />}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            styles={{
              root: {
                borderRadius: '8px',
                marginBottom: '4px',
              },
            }}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet context={{ user, clinic }} />
      </AppShell.Main>
    </AppShell>
  );
}

export default PostLogin;
