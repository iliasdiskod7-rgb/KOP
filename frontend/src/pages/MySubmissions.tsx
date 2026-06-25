import { useMemo } from 'react';
import { getStoredYpodeigma2Submissions } from '../features/forms/ypodeigma2/submissionStorage';

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

export default function MySubmissions() {
  const submissions = useMemo(() => getStoredYpodeigma2Submissions(), []);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-800">Οι Υποβολές μου</h1>
        <p className="mt-2 text-sm text-slate-600">
          Εδώ εμφανίζονται οι αποθηκευμένες υποβολές του Υποδείγματος 2 μέχρι να συνδεθεί η ροή με
          το backend.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        {submissions.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">
            Δεν υπάρχει ακόμη αποθηκευμένη υποβολή.
          </div>
        ) : (
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
                  <td className="border border-slate-200 px-4 py-3">
                    {formatDateTime(submission.createdAt)}
                  </td>
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
        )}
      </div>
    </section>
  );
}
