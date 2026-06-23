import { useState } from 'react';
import Login from './Login';
import Footer from './Footer';
import Dashboard from './Dashboard';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const handleLoginSuccess = (username: string) => {
    setUser(username);
    setIsLoggedIn(true);
  };
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      
      {/* Conditional Rendering: Αν είναι logged in δείξε το Dashboard, αλλιώς το Login */}
      {isLoggedIn ? (
        <Dashboard username={user} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
      <Footer />

    </div>
  );
}