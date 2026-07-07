import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStoredYpodeigma2Submissions } from '../features/forms/ypodeigma2/submissionStorage';
import type { Ypodeigma2Submission, Ypodeigma2SubmissionStatus } from '../features/forms/ypodeigma2/types';

type MySubmissionsLocationState = {
  successMessage?: string;
};

function formatAmount(value: number) {
  return new Intl.NumberFormat('el-GR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('el-GR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getStatusTitle(status: Ypodeigma2SubmissionStatus) {
  switch (status) {
    case 'pending-submission':
      return 'ΠΡΟΣ ΥΠΟΒΟΛΗ';
    case 'submitted':
      return 'ΥΠΟΒΛΗΘΕΙΣΕΣ';
    case 'returned-for-correction':
      return 'ΕΠΙΣΤΡΟΦΗ ΓΙΑ ΔΙΟΡΘΩΣΗ';
  }
}

function getStatusDescription(status: Ypodeigma2SubmissionStatus) {
  switch (status) {
    case 'pending-submission':
      return 'Αποθηκευμένες υποβολές που περιμένουν την τελική επιβεβαίωση.';
    case 'submitted':
      return 'Υποβολές που ολοκληρώθηκαν με οριστική υποβολή.';
    case 'returned-for-correction':
      return 'Υποβολές που επέστρεψαν για διορθώσεις πριν την επανυποβολή.';
  }
}

function getStatusEmptyMessage(status: Ypodeigma2SubmissionStatus) {
  switch (status) {
    case 'pending-submission':
      return 'Δεν υπάρχουν υποβολές προς υποβολή.';
    case 'submitted':
      return 'Δεν υπάρχουν υποβληθείσες υποβολές.';
    case 'returned-for-correction':
      return 'Δεν υπάρχουν επιστροφές για διόρθωση.';
  }
}

function getStatusAccent(status: Ypodeigma2SubmissionStatus) {
  switch (status) {
    case 'pending-submission':
      return {
        badge: 'bg-amber-100 text-amber-800',
        header: 'from-amber-50 to-orange-50',
      };
    case 'submitted':
      return {
        badge: 'bg-emerald-100 text-emerald-800',
        header: 'from-emerald-50 to-teal-50',
      };
    case 'returned-for-correction':
      return {
        badge: 'bg-rose-100 text-rose-800',
        header: 'from-rose-50 to-pink-50',
      };
  }
}

function SubmissionSection({
  status,
  submissions,
}: {
  status: Ypodeigma2SubmissionStatus;
  submissions: Ypodeigma2Submission[];
}) {
  const accent = getStatusAccent(status);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className={`border-b border-slate-200 bg-gradient-to-r ${accent.header} px-6 py-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{getStatusTitle(status)}</h2>
            <p className="mt-1 text-sm text-slate-600">{getStatusDescription(status)}</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-bold ${accent.badge}`}>
            {submissions.length} εγγραφή{submissions.length === 1 ? '' : 'ές'}
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="p-6 text-sm text-slate-500">{getStatusEmptyMessage(status)}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-800">
              <tr>
                <th className="border border-slate-200 px-4 py-3 text-left font-semibold">Ημερομηνία</th>
                <th className="border border-slate-200 px-4 py-3 text-left font-semibold">Ενότητα</th>
                <th className="border border-slate-200 px-4 py-3 text-left font-semibold">Μοίρες</th>
                <th className="border border-slate-200 px-4 py-3 text-left font-semibold">Γραμμές</th>
                <th className="border border-slate-200 px-4 py-3 text-right font-semibold">Σύνολο</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="bg-white">
                  <td className="border border-slate-200 px-4 py-3">{formatDateTime(submission.createdAt)}</td>
                  <td className="border border-slate-200 px-4 py-3">
                    <div className="font-semibold text-slate-800">{submission.sectionId}</div>
                    <div className="text-xs text-slate-500">{submission.sectionTitle}</div>
                  </td>
                  <td className="border border-slate-200 px-4 py-3">{submission.moiraCount}</td>
                  <td className="border border-slate-200 px-4 py-3">{submission.rowCount}</td>
                  <td className="border border-slate-200 px-4 py-3 text-right font-bold text-slate-900">
                    {formatAmount(submission.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function MySubmissions() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as MySubmissionsLocationState;
  const [toastMessage, setToastMessage] = useState(state.successMessage ?? '');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [submissions, setSubmissions] = useState(() => getStoredYpodeigma2Submissions());

  useEffect(() => {
    setSubmissions(getStoredYpodeigma2Submissions());
  }, [location.key]);

  useEffect(() => {
    setToastMessage(state.successMessage ?? '');
    setIsToastVisible(false);
  }, [state.successMessage]);

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

  const pendingSubmissions = useMemo(
    () => submissions.filter((submission) => submission.status === 'pending-submission'),
    [submissions],
  );
  const submittedSubmissions = useMemo(
    () => submissions.filter((submission) => submission.status === 'submitted'),
    [submissions],
  );
  const returnedSubmissions = useMemo(
    () => submissions.filter((submission) => submission.status === 'returned-for-correction'),
    [submissions],
  );

  return (
    <section className="space-y-6">
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
                <div className="text-base font-bold tracking-wide text-emerald-700">Ενημέρωση Υποβολής</div>
                <div className="mt-1 text-sm leading-6 text-slate-700">{toastMessage}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-800">Οι Υποβολές μου</h1>
        <p className="mt-2 text-sm text-slate-600">
          Εδώ εμφανίζονται όλες οι υποβολές του Υποδείγματος 2, χωρισμένες ανά κατάσταση, μέχρι να συνδεθεί πλήρως η
          ροή με το backend.
        </p>
      </div>

      <SubmissionSection status="pending-submission" submissions={pendingSubmissions} />
      <SubmissionSection status="submitted" submissions={submittedSubmissions} />
      <SubmissionSection status="returned-for-correction" submissions={returnedSubmissions} />
    </section>
  );
}
