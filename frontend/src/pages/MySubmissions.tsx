import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStoredYpodeigma2Submissions } from '../features/forms/ypodeigma2/submissionStorage';
import type { Ypodeigma2Submission, Ypodeigma2SubmissionStatus } from '../features/forms/ypodeigma2/types';

type FlashMessage = {
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
};

type MySubmissionsLocationState = {
  successMessage?: string;
  flashMessage?: FlashMessage;
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
      return 'Υποβολές που επιστράφηκαν για διορθώσεις πριν την επανυποβολή.';
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

function getFlashMessageClasses(type: FlashMessage['type']) {
  if (type === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }

  if (type === 'error') {
    return 'border-rose-200 bg-rose-50 text-rose-800';
  }

  return 'border-sky-200 bg-sky-50 text-sky-800';
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
  const state = (location.state ?? null) as MySubmissionsLocationState | null;
  const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null);
  const [submissions, setSubmissions] = useState(() => getStoredYpodeigma2Submissions());

  useEffect(() => {
    setSubmissions(getStoredYpodeigma2Submissions());
  }, [location.key]);

  useEffect(() => {
    if (!state?.successMessage && !state?.flashMessage) {
      return;
    }

    const nextMessage: FlashMessage =
      state.flashMessage ?? {
        type: 'success',
        title: state.successMessage ?? '',
      };

    setFlashMessage(nextMessage);

    navigate(location.pathname, { replace: true, state: null });

    const timeoutId = window.setTimeout(() => {
      setFlashMessage(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [location.pathname, navigate, state]);

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
      {flashMessage ? (
        <div className={`rounded-2xl border px-5 py-4 text-sm shadow-sm ${getFlashMessageClasses(flashMessage.type)}`}>
          <p className="font-semibold">{flashMessage.title}</p>
          {flashMessage.description ? <p className="mt-1">{flashMessage.description}</p> : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-800">Οι Υποβολές μου</h1>
        <p className="mt-2 text-sm text-slate-600">
          Εδώ εμφανίζονται όλες οι υποβολές του Υποδείγματος 2, χωρισμένες ανά κατάσταση.
        </p>
      </div>

      <SubmissionSection status="pending-submission" submissions={pendingSubmissions} />
      <SubmissionSection status="submitted" submissions={submittedSubmissions} />
      <SubmissionSection status="returned-for-correction" submissions={returnedSubmissions} />
    </section>
  );
}
