import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import hafg from '../assets/haf1.png';
import KOP from '../assets/KOP.png';
import type { AppUserRole } from '../types/auth';

interface LoginProps {
  onLoginSuccess: (username: string, role: AppUserRole) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AppUserRole>('user');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username.trim() !== '') {
      onLoginSuccess(username, role);
      navigate('/dashboard');
    }

    console.log('Αποστολή στο backend:', { username, password, role });
  };

  return (
    <div className="flex flex-grow items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-50 bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-center space-x-4">
          <img src={hafg} alt="HAF Logo" className="h-25 w-25 object-contain" />
          <img src={KOP} alt="KOP Logo" className="h-24 w-22 object-contain" />
        </div>

        <h2 className="mb-8 text-center text-3xl font-bold text-slate-800">Καλώς ήρθατε</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold tracking-wide text-slate-500">Όνομα Χρήστη</label>
            <input
              type="text"
              placeholder="Πληκτρολογήστε το όνομα χρήστη"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-slate-800 px-4 py-3 text-white placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold tracking-wide text-slate-500">Κωδικός</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-800 px-4 py-3 text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold tracking-wide text-slate-500">Ρόλος</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AppUserRole)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="user">Χρήστης</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-bold uppercase tracking-wider text-white shadow-md transition-all duration-150 hover:bg-blue-700 hover:shadow-lg active:scale-[0.99]"
          >
            Σύνδεση
          </button>
        </form>
      </div>
    </div>
  );
}
