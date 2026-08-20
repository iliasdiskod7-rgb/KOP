import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { clearAppInitCache, getAppInit } from './api/appApi';
import { login } from './api/authApi';
import {
  canUseAuthenticatedApi,
  clearStoredAccessToken,
  getApiBaseUrl,
  getApiErrorMessage,
  getStoredAccessToken,
  storeAccessToken,
} from './api/httpClient';
import type { Role } from './api/types';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import type { AuthUser, AppUserRole } from './types/auth';

const STORAGE_KEY = 'kop-auth-user';

function mapBackendRolesToAppRole(roles: Role[]): AppUserRole {
  return roles.includes('SystemAdmin') || roles.includes('SystemDeveloper') ? 'admin' : 'user';
}

function readStoredUser(): AuthUser | null {
  const storedValue = localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<AuthUser> | string;

    if (typeof parsedValue === 'string') {
      return parsedValue.trim() ? { username: parsedValue, role: 'user' } : null;
    }

    if (
      parsedValue &&
      typeof parsedValue.username === 'string' &&
      (parsedValue.role === 'user' || parsedValue.role === 'admin')
    ) {
      return {
        username: parsedValue.username,
        role: parsedValue.role,
      };
    }
  } catch {
    if (storedValue.trim()) {
      return { username: storedValue, role: 'user' };
    }
  }

  return null;
}

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => readStoredUser());
  const usesBackend = Boolean(getApiBaseUrl());
  const hasBackendSession = !usesBackend || Boolean(getStoredAccessToken());
  const isLoggedIn =
    authUser !== null && authUser.username.trim() !== '' && hasBackendSession;

  useEffect(() => {
    if (!canUseAuthenticatedApi()) {
      return;
    }

    let isMounted = true;

    getAppInit()
      .then((appInit) => {
        if (!isMounted) {
          return;
        }

        setAuthUser({
          username: appInit.userInfo.fullName,
          role: mapBackendRolesToAppRole(appInit.userRoles),
        });
      })
      .catch((error: unknown) => {
        console.error('Αποτυχία αρχικοποίησης εφαρμογής από το backend.', error);
        clearStoredAccessToken();
        clearAppInitCache();
        setAuthUser(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (authUser?.username.trim()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [authUser]);

  const handleLogin = async (username: string, password: string, mockRole: AppUserRole) => {
    if (!getApiBaseUrl()) {
      setAuthUser({ username, role: mockRole });
      return;
    }

    try {
      const loginResponse = await login({ username, password });
      storeAccessToken(loginResponse.accessToken);
      clearAppInitCache();

      const appInit = await getAppInit();
      setAuthUser({
        username: appInit.userInfo.fullName,
        role: mapBackendRolesToAppRole(appInit.userRoles),
      });
    } catch (error: unknown) {
      clearStoredAccessToken();
      clearAppInitCache();
      throw new Error(getApiErrorMessage(error), { cause: error });
    }
  };

  const handleLogout = () => {
    clearStoredAccessToken();
    clearAppInitCache();
    setAuthUser(null);
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-100 font-sans">
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard/ypologismos" replace />
            ) : (
              <Login onLogin={handleLogin} usesBackend={usesBackend} />
            )
          }
        />
        <Route
          path="/dashboard/*"
          element={
            isLoggedIn && authUser ? (
              <Dashboard username={authUser.username} role={authUser.role} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}
