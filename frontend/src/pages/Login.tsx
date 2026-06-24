import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import hafg from '../assets/haf1.png';
import KOP from '../assets/KOP.png';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username.trim() !== '') {
      onLoginSuccess(username);
      navigate('/dashboard');
    }

    console.log('Αποστολή στο backend:', { username, password });
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-50">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <img src={hafg} alt="HAF Logo" className="w-25 h-25 object-contain" />
          <img src={KOP} alt="KOP Logo" className="w-22 h-24 object-contain" />
        </div>

        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">Καλώς ήρθατε</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-slate-500 tracking-wide">
              Όνομα Χρήστη
            </label>
            <input
              type="text"
              placeholder="Πληκτρολογήστε το όνομα χρήστη"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              required
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-slate-500 tracking-wide">Κωδικός</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wider rounded-lg shadow-md hover:shadow-lg active:scale-[0.99] transition-all duration-150 uppercase"
          >
            ΣΥΝΔΕΣΗ
          </button>
        </form>
      </div>
    </div>
  );
}
