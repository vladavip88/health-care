import { useEffect, useState } from 'react';
import styles from './Dashboard.module.scss';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  clinicId: string;
}

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>

      {user && (
        <div className={styles.userInfo}>
          <h2>Welcome, {user.firstName || user.email}!</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <p className={styles.label}>Email</p>
              <p className={styles.value}>{user.email}</p>
            </div>
            <div className={styles.infoCard}>
              <p className={styles.label}>Role</p>
              <p className={styles.value}>{user.role}</p>
            </div>
            <div className={styles.infoCard}>
              <p className={styles.label}>Clinic ID</p>
              <p className={styles.value}>{user.clinicId}</p>
            </div>
            <div className={styles.infoCard}>
              <p className={styles.label}>User ID</p>
              <p className={styles.value}>{user.id}</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.placeholderContent}>
        <p>Your dashboard content will go here.</p>
      </div>
    </div>
  );
}

export default Dashboard;
