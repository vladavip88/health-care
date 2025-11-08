import { Outlet } from 'react-router-dom';
import { Center, Box } from '@mantine/core';
import styles from './PreLogin.module.scss';

export function PreLogin() {
  return (
    <Box className={styles.container} style={{ minHeight: '100vh' }}>
      <Center style={{ minHeight: '100vh' }}>
        <Outlet />
      </Center>
    </Box>
  );
}

export default PreLogin;
