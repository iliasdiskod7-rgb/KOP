import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import hafEmblem from '../assets/haf1.png';
import Navbar from '../components/Navbar';
import DynamicForm from '../features/forms/DynamicForm';
import MySubmissions from './MySubmissions';
import type { AppUserRole } from '../types/auth';

interface DashboardProps {
  onLogout: () => void;
  username: string;
  role: AppUserRole;
  orgUnitId?: number;
  orgUnitTitle?: string;
  epistasia?: string;
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

type DashboardHomeProps = {
  username: string;
  orgUnitTitle?: string;
};

function DashboardHome({ username, orgUnitTitle }: DashboardHomeProps) {
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
      <div className="space-y-5">
        <section className="relative isolate min-h-[340px] overflow-hidden rounded-[32px] border border-sky-900/20 bg-slate-950 text-white shadow-2xl shadow-slate-300/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(14,165,233,0.28),transparent_34%),linear-gradient(125deg,#071329_0%,#0b2447_48%,#075985_100%)]" />
          <div className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full border border-white/10 bg-sky-300/10 blur-sm" />
          <div className="absolute -left-24 top-16 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />
          <img
            src={hafEmblem}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 top-1/2 w-72 -translate-y-1/2 rotate-3 select-none object-contain opacity-[0.16] sm:right-8 sm:w-80 lg:right-14 lg:w-[23rem]"
          />

          <div className="relative z-10 flex min-h-[340px] max-w-3xl flex-col justify-center px-7 py-9 sm:px-10 lg:px-14">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.9)]" />
              Πολεμική Αεροπορία
            </div>

            <p className="text-sm font-semibold text-sky-200">Καλώς ήρθατε, {username}</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              ΚΩΠ
              <span className="mt-1 block text-xl font-semibold text-white/90 sm:text-2xl">
                Διαχείριση και Υποβολή Δεδομένων
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
              Κεντρικό περιβάλλον καταχώρησης, ελέγχου και παρακολούθησης των Υποδειγμάτων ΚΩΠ,
              με οργανωμένη ροή ανά έτος και Μονάδα.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/dashboard/ypodeigma/1')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-950/30 transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-sky-400"
              >
                Άνοιγμα Υποδείγματος 1
                <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/my-submissions')}
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/15"
              >
                Οι Υποβολές μου
              </button>
            </div>

            {orgUnitTitle?.trim() ? (
              <div className="mt-6 w-fit rounded-lg border border-white/10 bg-black/15 px-3 py-2 text-xs text-slate-300 backdrop-blur">
                Ενεργή Μονάδα: <span className="font-bold text-white">{orgUnitTitle}</span>
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              number: '01',
              title: 'Επιλογή Υποδείγματος',
              description: 'Ανοίξτε το αριστερό μενού και επιλέξτε το Υπόδειγμα που θέλετε να διαχειριστείτε.',
            },
            {
              number: '02',
              title: 'Έτος και Μονάδα',
              description: 'Ανακτήστε υπάρχον έτος ή ξεκινήστε νέα καταχώρηση για την επιτρεπόμενη Μονάδα.',
            },
            {
              number: '03',
              title: 'Αποθήκευση και Υποβολή',
              description: 'Αποθηκεύστε προσωρινά την εργασία σας ή προχωρήστε σε οριστική υποβολή.',
            },
          ].map((step) => (
            <article
              key={step.number}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 font-mono text-sm font-black text-sky-700 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                  {step.number}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{step.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{step.description}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
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

export default function Dashboard({
  onLogout,
  username,
  role,
  orgUnitId,
  orgUnitTitle,
  epistasia,
}: DashboardProps) {
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
        orgUnitId={orgUnitId}
        orgUnitTitle={orgUnitTitle}
        epistasia={epistasia}
      />

      <main className="mx-auto max-w-7xl p-8">
      <Routes>
  <Route index element={<Navigate to="ypologismos" replace />} />
  <Route
    path="ypologismos"
    element={<DashboardHome username={username} orgUnitTitle={orgUnitTitle} />}
  />
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
