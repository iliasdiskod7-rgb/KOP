import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DynamicForm from '../features/forms/DynamicForm';
import MySubmissions from './MySubmissions';

interface DashboardProps {
  onLogout: () => void;
  username: string;
}

type DashboardLocationState = {
  successMessage?: string;
};

function DashboardHome() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as DashboardLocationState;
  const [toastMessage, setToastMessage] = useState(state.successMessage ?? '');
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    if (!state.successMessage) {
      return;
    }

    setToastMessage(state.successMessage);
    const enterTimer = window.setTimeout(() => {
      setIsToastVisible(true);
    }, 20);

    const fadeTimer = window.setTimeout(() => {
      setIsToastVisible(false);
    }, 2500);

    const cleanupTimer = window.setTimeout(() => {
      setToastMessage('');
      navigate(location.pathname, { replace: true, state: null });
    }, 10000);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(cleanupTimer);
    };
  }, [location.pathname, navigate, state.successMessage]);

  return (
    <>
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Καρτέλα: ΥΠΟΛ ΚΩΠ</h1>
      </div>

      {toastMessage ? (
        <div className="pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center px-4">
          <div
            className={`relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-emerald-200 bg-white/95 shadow-2xl backdrop-blur transition-all duration-500 ease-out ${
              isToastVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-cyan-50" />
            <div className="relative flex items-center gap-4 px-6 py-5 sm:px-7 sm:py-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-3xl font-black text-emerald-600 shadow-inner">
                ✓
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold tracking-wide text-emerald-700">Αποθήκευση Επιτυχής</div>
                <div className="mt-1 text-sm leading-6 text-slate-700">{toastMessage}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DashboardFormRoute() {
  const { id } = useParams();
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    return <Navigate to="/dashboard/ypologismos" replace />;
  }

  return <DynamicForm id={parsedId} />;
}

export default function Dashboard({ onLogout, username }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.startsWith('/dashboard/ypodeigma/')
    ? `ypodeigma${location.pathname.split('/').at(-1) ?? ''}`
    : location.pathname.startsWith('/dashboard/my-submissions')
      ? 'my-submissions'
      : 'ypologismos';

  const handleTabChange = (tab: string) => {
    if (tab === 'ypologismos') {
      navigate('/dashboard/ypologismos');
      return;
    }

    if (tab === 'my-submissions') {
      navigate('/dashboard/my-submissions');
      return;
    }

    const id = tab.replace('ypodeigma', '');
    navigate(`/dashboard/ypodeigma/${id}`);
  };

  return (
    <div className="flex-grow bg-slate-50">
      <Navbar
        activeTab={activeTab}
        onLogout={onLogout}
        onTabChange={handleTabChange}
        username={username}
      />

      <main className="mx-auto max-w-7xl p-8">
        <Routes>
          <Route index element={<Navigate to="ypologismos" replace />} />
          <Route path="ypologismos" element={<DashboardHome />} />
          <Route path="my-submissions" element={<MySubmissions />} />
          <Route path="ypodeigma/:id" element={<DashboardFormRoute />} />
          <Route path="*" element={<Navigate to="ypologismos" replace />} />
        </Routes>
      </main>
    </div>
  );
}
