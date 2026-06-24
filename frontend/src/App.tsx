import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

const STORAGE_KEY = 'kop-auth-user';

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const isLoggedIn = user.trim() !== '';

  useEffect(() => {
    if (user.trim()) {
      localStorage.setItem(STORAGE_KEY, user);
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const handleLoginSuccess = (username: string) => {
    setUser(username);
  };

  const handleLogout = () => {
    setUser('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
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
            isLoggedIn ? (
              <Dashboard username={user} onLogout={handleLogout} />
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
