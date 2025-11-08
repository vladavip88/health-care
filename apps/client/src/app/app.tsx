// Uncomment this line to use CSS modules
// import styles from './app.module.scss';
import { ApolloProvider } from '@apollo/client/react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { apolloClient } from '../apollo/client';
import { AuthProvider } from '../auth/AuthProvider';
import { PrivateRoute } from '../auth/PrivateRoute';
import { PublicRoute } from '../auth/PublicRoute';
import PreLogin from '../layouts/PreLogin/PreLogin';
import PostLogin from '../layouts/PostLogin/PostLogin';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import ClinicSelection from '../pages/ClinicSelection/ClinicSelection';
import Dashboard from '../pages/Dashboard/Dashboard';

export function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <Routes>
          {/* Public routes - redirects to dashboard if authenticated */}
          <Route element={<PreLogin />}>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/clinic-selection"
              element={
                <PublicRoute>
                  <ClinicSelection />
                </PublicRoute>
              }
            />
          </Route>

          {/* Private routes - requires authentication */}
          <Route
            element={
              <PrivateRoute>
                <PostLogin />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Redirect root to dashboard if authenticated, otherwise to login */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Navigate to="/dashboard" replace />
              </PrivateRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
