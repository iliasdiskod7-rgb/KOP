import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import type { AuthUser, AppUserRole } from './types/auth';

const STORAGE_KEY = 'kop-auth-user';

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
  const isLoggedIn = authUser !== null && authUser.username.trim() !== '';

  useEffect(() => {
    if (authUser?.username.trim()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [authUser]);

  const handleLoginSuccess = (username: string, role: AppUserRole) => {
    setAuthUser({ username, role });
  };

  const handleLogout = () => {
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
              <Login onLoginSuccess={handleLoginSuccess} />
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
