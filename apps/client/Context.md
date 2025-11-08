# ⚛️ React UI Context — Project Architecture Guidelines

## 🔧 Overview

This document defines the architectural and organizational conventions for the **React frontend** of the project.  
It ensures maintainability, modularity, and a consistent developer experience across all UI components and pages.

---

## 🧠 Core Principles

1. Keep logic separated from presentation.
2. Use **Apollo Client** for GraphQL queries and mutations.
3. Never call `useQuery` or `useMutation` directly inside components.
4. Encapsulate data logic into **custom hooks**.
5. Split pages into smaller, reusable components.
6. Maintain a clear folder structure with strict naming conventions.
7. Use **SCSS modules** for styling.
8. Use **react-hook-form** for all form handling.
9. Use **Yup** for form validation.
10. Use **Mantine UI** as the main UI component library.
11. Use **React Router** for client-side routing and navigation.

---

## 📁 Folder Structure

```
src/
 ├── apollo/
 │    ├── client.ts
 │    ├── queries/
 │    ├── mutations/
 │    └── hooks/
 │
 ├── auth/
 │    ├── AuthProvider.tsx       # Handles user session & token management
 │    ├── useAuth.ts             # Custom hook to access auth context
 │    ├── PrivateRoute.tsx       # Protects private routes
 │    └── PublicRoute.tsx        # Handles redirects for logged users
 │
 ├── components/
 ├── pages/
 ├── router/
 │    └── AppRouter.tsx          # Defines all routes using React Router
 │
 ├── styles/
 ├── utils/
 └── main.tsx
```

---

## 🚀 Apollo Client Integration

Standard setup with link and cache configuration.

All queries and mutations are defined in `/apollo/queries` and `/apollo/mutations` and wrapped by custom hooks.

---

## 🪝 Custom Hooks

Each query/mutation should be wrapped in its own custom hook that handles loading, success, and error states with notifications (e.g., `react-toastify`).

---

## 🧰 Forms and Validation

### Form Handling — `react-hook-form`

Use **react-hook-form** for all form state and submission handling.

### Validation — `Yup`

Use **Yup** schemas integrated via `@hookform/resolvers/yup` for consistent, declarative validation.

---

## 🎨 UI Library — Mantine UI

Use **Mantine UI** as the main component library for consistent, accessible, and customizable UI elements.  
Use Mantine layout components (`Container`, `Flex`, `Grid`) and inputs (`TextInput`, `Select`, `Button`) across the app.

---

## 🌐 Routing — React Router

The app uses **React Router v6+** for navigation.

### Routing Setup (`router/AppRouter.tsx`)

Define all routes inside a central router component, separating **Public** and **Private** routes.

Example structure:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from '../auth/PrivateRoute';
import { PublicRoute } from '../auth/PublicRoute';
import LoginPage from '../pages/Login/Login';
import DashboardPage from '../pages/Dashboard/Dashboard';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Private routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="*"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);
```

---

## 🔐 Authentication Flow

### Overview

Authentication state is managed through a global `AuthProvider` using React Context.  
User and clinic data are fetched separately at app startup.

### AuthProvider Responsibilities

1. Store `accessToken` (from localStorage or cookie).
2. Fetch `User` and `Clinic` data on app initialization.
3. Expose auth state (`isAuthenticated`, `user`, `clinic`) via context.
4. Provide `login`, `logout`, and `refresh` functions.

### Behavior Rules

#### 🔒 Private Routes

- If the user **is authenticated**, they can access the page.
- If the user **is not authenticated**, they are **redirected to the default Public route** (e.g., `/login`).

#### 🔓 Public Routes

- If the user **is authenticated**, they are **redirected to the default Private route** (e.g., `/dashboard`).
- If the user **is not authenticated**, they can stay on the page (e.g., `/login` or `/register`).

### Auth Logic on App Start

When the app loads:

1. Attempt to **fetch user data** and **clinic data** from the server (two separate requests).
2. If either request returns `401 Unauthorized` or no data:
   - Log out the user.
   - Clear local storage and tokens.
   - Redirect to the default Public route (`/login`).
3. If both are valid:
   - Store the data in context.
   - Continue loading the app and render Private routes.

---

### Example — AuthProvider

```tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../apollo/hooks/useUser';
import { useClinic } from '../apollo/hooks/useClinic';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [clinic, setClinic] = useState(null);
  const navigate = useNavigate();

  const { data: userData, error: userError } = useUser();
  const { data: clinicData, error: clinicError } = useClinic();

  useEffect(() => {
    if (userError || clinicError) {
      logout();
    } else if (userData && clinicData) {
      setUser(userData);
      setClinic(clinicData);
      setIsAuthenticated(true);
    }
  }, [userData, clinicData, userError, clinicError]);

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setClinic(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return <AuthContext.Provider value={{ isAuthenticated, user, clinic, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
```

---

### Example — PrivateRoute

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
```

### Example — PublicRoute

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};
```

---

## 🎨 Styling

Use **SCSS modules** for all components with a matching file name.  
Global variables, mixins, and themes live in `/styles/`.

---

## ✅ Summary

- Apollo Client for GraphQL communication
- Custom hooks for all queries and mutations
- Mantine UI as the main component library
- react-hook-form + Yup for forms and validation
- React Router for route handling
- Auth flow with Private/Public routes
- Automatic user/clinic data fetch on load
- SCSS modules for consistent styling

This structure ensures scalability, clean separation of concerns, and a predictable development workflow.
