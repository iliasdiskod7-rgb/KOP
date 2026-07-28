import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DynamicForm from '../features/forms/DynamicForm';
import MySubmissions from './MySubmissions';
import type { AppUserRole } from '../types/auth';

interface DashboardProps {
  onLogout: () => void;
  username: string;
  role: AppUserRole;
}

type DashboardLocationState = {
  successMessage?: string;
};

type DashboardWindow = Window & {
  __kopUnsavedGuard?: {
    continueWithoutSaving: () => void;
    hasUnsavedChanges: boolean;
    submitFinal: () => Promise<void>;
    summary: string;
    temporarySave: () => Promise<void>;
  };
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

export default function Dashboard({ onLogout, username, role }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [isGuardBusy, setIsGuardBusy] = useState(false);

  const activeTab = location.pathname.startsWith('/dashboard/ypodeigma/')
    ? `ypodeigma${location.pathname.split('/').at(-1) ?? ''}`
    : location.pathname.startsWith('/dashboard/my-submissions')
      ? 'my-submissions'
      : 'ypologismos';

  const handleTabChange = (tab: string) => {
    const guardedWindow = window as DashboardWindow;
    const guard = guardedWindow.__kopUnsavedGuard;

    if (guard?.hasUnsavedChanges) {
      setPendingTab(tab);
      return;
    }

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
    <div className="flex-grow overflow-x-hidden bg-slate-50">
      {pendingTab ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xl font-black text-amber-600">
                !
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-slate-900">Δεν έχετε αποθηκεύσει τα δεδομένα σας</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Υπάρχει νέο έτος σε εκκρεμότητα χωρίς αποθήκευση. Αν αλλάξετε υπόδειγμα τώρα, τα μη
                  αποθηκευμένα δεδομένα θα χαθούν.
                </p>
                {((window as DashboardWindow).__kopUnsavedGuard?.summary ?? '') ? (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {(window as DashboardWindow).__kopUnsavedGuard?.summary}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:grid sm:grid-cols-4">
              <button
                type="button"
                onClick={() => {
                  setPendingTab(null);
                }}
                disabled={isGuardBusy}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-rose-700 to-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:from-rose-800 hover:to-red-600 hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:hover:translate-y-0 disabled:hover:scale-100"
              >
                Επιστροφή
              </button>
              <button
                type="button"
                onClick={() => {
                  const guard = (window as DashboardWindow).__kopUnsavedGuard;

                  if (!guard) {
                    setPendingTab(null);
                    return;
                  }

                  setIsGuardBusy(true);
                  void guard.temporarySave().finally(() => {
                    setIsGuardBusy(false);
                    setPendingTab(null);
                  });
                }}
                disabled={isGuardBusy}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-white disabled:hover:translate-y-0 disabled:hover:scale-100"
              >
                Προσωρινή Αποθήκευση
              </button>

              <button
                type="button"
                onClick={() => {
                  const guard = (window as DashboardWindow).__kopUnsavedGuard;

                  if (!guard) {
                    setPendingTab(null);
                    return;
                  }

                  setIsGuardBusy(true);
                  void guard.submitFinal().finally(() => {
                    setIsGuardBusy(false);
                    setPendingTab(null);
                  });
                }}
                disabled={isGuardBusy}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:hover:translate-y-0 disabled:hover:scale-100"
              >
                Οριστική Υποβολή
              </button>

              <button
                type="button"
                onClick={() => {
                  const guard = (window as DashboardWindow).__kopUnsavedGuard;
                  const nextTab = pendingTab;

                  guard?.continueWithoutSaving();
                  setPendingTab(null);

                  if (!nextTab) {
                    return;
                  }

                  if (nextTab === 'ypologismos') {
                    navigate('/dashboard/ypologismos');
                    return;
                  }

                  if (nextTab === 'my-submissions') {
                    navigate('/dashboard/my-submissions');
                    return;
                  }

                  const nextId = nextTab.replace('ypodeigma', '');
                  navigate(`/dashboard/ypodeigma/${nextId}`);
                }}
                disabled={isGuardBusy}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-slate-600 to-slate-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-white disabled:hover:translate-y-0 disabled:hover:scale-100"
              >
                Συνέχεια χωρίς αποθήκευση
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Navbar
        activeTab={activeTab}
        onLogout={onLogout}
        onTabChange={handleTabChange}
        username={username}
        role={role}
      />

      <main className="mx-auto max-w-7xl p-8">
      <Routes>
  <Route index element={<Navigate to="ypologismos" replace />} />
  <Route path="ypologismos" element={<DashboardHome />} />
  <Route path="my-submissions" element={<MySubmissions />} />
  <Route path="ypodeigma/:id" element={<DashboardFormRouteWrapper role={role} />} />
  <Route path="*" element={<Navigate to="ypologismos" replace />} />
</Routes>
      </main>
    </div>
  );
}

function DashboardFormRouteWrapper({ role }: { role: AppUserRole }) {
  const { id } = useParams();
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    return <Navigate to="/dashboard/ypologismos" replace />;
  }

  return <DynamicForm id={parsedId} role={role} />;
}
