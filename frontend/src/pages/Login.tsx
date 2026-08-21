import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import hafg from '../assets/haf1.png';
import KOP from '../assets/KOP.png';
import type { AppUserRole } from '../types/auth';

interface LoginProps {
  onLogin: (username: string, password: string, mockRole: AppUserRole) => Promise<void>;
  usesBackend: boolean;
  noticeMessage?: string | null;
}

export default function Login({ onLogin, usesBackend, noticeMessage }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AppUserRole>('user');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onLogin(username.trim(), password, role);
      navigate('/dashboard/ypologismos', { replace: true });
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error && error.message.trim()
          ? error.message
          : 'Η σύνδεση απέτυχε. Προσπαθήστε ξανά.',
      );
    } finally {
      setIsSubmitting(false);
    }
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

          {!usesBackend ? (
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
          ) : null}

          {noticeMessage ? (
            <div
              role="status"
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {noticeMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 py-3 font-bold uppercase tracking-wider text-white shadow-md transition-all duration-150 hover:bg-blue-700 hover:shadow-lg active:scale-[0.99] disabled:cursor-wait disabled:bg-slate-400 disabled:shadow-none"
          >
            {isSubmitting ? 'Σύνδεση...' : 'Σύνδεση'}
          </button>
        </form>
      </div>
    </div>
  );
}
