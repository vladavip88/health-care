import { createContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../apollo/hooks/useCurrentUser';
import { useLogout as useLogoutMutation } from '../apollo/hooks/useLogout';

interface Clinic {
  id: string;
  name: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  clinicId: string;
  clinic?: Clinic;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  clinic: Clinic | null;
  loading: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [tokenCheckId, setTokenCheckId] = useState(0);
  const navigate = useNavigate();

  // Fetch user and clinic data from API
  const { user: fetchedUser, clinic: fetchedClinic, loading: userLoading, error: userError, refetch } = useCurrentUser();

  // Logout mutation
  const { logout: logoutMutation } = useLogoutMutation();

  useEffect(() => {
    // If there's an access token, try to fetch user data
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      // No token, user is not authenticated
      setIsAuthenticated(false);
      setUser(null);
      setClinic(null);
      setInitializing(false);
      return;
    }

    // If user data is still loading, wait
    if (userLoading) {
      return;
    }

    // If there was an error fetching user data, logout
    if (userError) {
      logout();
      return;
    }

    // If user data is available, update auth state
    if (fetchedUser && fetchedClinic) {
      setUser(fetchedUser);
      setClinic(fetchedClinic);
      setIsAuthenticated(true);
      setInitializing(false);
    }
  }, [fetchedUser, fetchedClinic, userLoading, userError, tokenCheckId]);

  const logout = async () => {
    try {
      // Get refresh token before clearing localStorage
      const refreshToken = localStorage.getItem('refreshToken');

      // Call logout API mutation if refresh token exists
      if (refreshToken) {
        await logoutMutation(refreshToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local state and storage
      setIsAuthenticated(false);
      setUser(null);
      setClinic(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login', { replace: true });
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    clinic,
    loading: initializing || userLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
