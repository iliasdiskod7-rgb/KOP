import { useMemo, useState, type FC } from 'react';
import { calculateAleColumnTotal, calculateGrandTotal, calculateRowTotal, getAmountKey } from './helpers';
import type { Ypodeigma2Ale, Ypodeigma2Moira, Ypodeigma2Row, Ypodeigma2SectionConfig } from './types';

function formatAmount(value: number) {
  return new Intl.NumberFormat('el-GR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function buildReviewAleColumns(moires: Ypodeigma2Moira[]) {
  const firstMoira = [...moires].sort((left, right) => left.displayOrder - right.displayOrder)[0];
  return firstMoira ? [...firstMoira.ales].sort((left, right) => left.displayOrder - right.displayOrder) : [];
}

function calculateReviewCellValue(row: Ypodeigma2Row, ale: Ypodeigma2Ale, moires: Ypodeigma2Moira[]) {
  return moires.reduce((total, moira) => {
    const matchingAle = moira.ales.find((candidate) => candidate.displayOrder === ale.displayOrder);

    if (!matchingAle) {
      return total;
    }

    return total + (row.values[getAmountKey(moira.id, matchingAle.id)] ?? 0);
  }, 0);
}

function calculateReviewRowTotal(
  row: Ypodeigma2Row,
  aleColumns: Ypodeigma2Ale[],
  moires: Ypodeigma2Moira[],
) {
  return aleColumns.reduce((total, ale) => total + calculateReviewCellValue(row, ale, moires), 0);
}

function calculateReviewAleColumnTotal(
  ale: Ypodeigma2Ale,
  rows: Ypodeigma2Row[],
  moires: Ypodeigma2Moira[],
) {
  return rows.reduce((total, row) => total + calculateReviewCellValue(row, ale, moires), 0);
}

function calculateMoiraTotal(moira: Ypodeigma2Moira, rows: Ypodeigma2Row[]) {
  return rows.reduce((total, row) => total + calculateRowTotal(row, [moira]), 0);
}

function buildTopTableColumnCount(moires: Ypodeigma2Moira[]) {
  return 8 + moires.reduce((count, moira) => count + moira.ales.length + 1, 0);
}

type Props = {
  rows: Ypodeigma2Row[];
  section: Ypodeigma2SectionConfig;
  onBack: () => void;
  onSave: () => void;
};

const Ypodeigma2ReviewTable: FC<Props> = ({ rows, section, onBack, onSave }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const reviewAleColumns = useMemo(() => buildReviewAleColumns(section.moires), [section.moires]);
  const grandTotal = calculateGrandTotal(rows, section.moires);
  const topTableColumnCount = useMemo(() => buildTopTableColumnCount(section.moires), [section.moires]);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="mb-2 text-lg font-bold">Προεπισκόπηση Αποθήκευσης - Υπόδειγμα 2</h2>
        <p className="text-sm text-slate-600">
          Εδώ ο χρήστης ελέγχει πρώτα τα σύνολα όλων των μοιρών και μετά τον τελικό συγκεντρωτικό πίνακα
          πριν την οριστική καταχώριση.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-slate-50">
        <table className="min-w-max border-collapse text-[11px] text-slate-800">
          <colgroup>
            <col className="w-24" />
            {Array.from({ length: 6 }).map((_, index) => (
              <col key={`top-analysis-col-${index + 1}`} className="w-7" />
            ))}
            <col className="w-64" />
            {section.moires.flatMap((moira) => [
              ...moira.ales.map((ale) => <col key={`top-${moira.id}-${ale.id}`} className="w-20" />),
              <col key={`top-syn-${moira.id}`} className="w-20" />,
            ])}
          </colgroup>

          <thead>
            <tr>
              <th
                colSpan={topTableColumnCount}
                className="border border-slate-400 bg-slate-200 px-4 py-3 text-center text-sm font-bold"
              >
                1Α Οδοιπορικά Έξοδα Μετακινήσεων Πληρωμάτων Α/Φ και Προσωπικού Συντήρησης Μοιρών Α/Φ
              </th>
            </tr>
            <tr>
              <th rowSpan={4} className="border border-slate-400 bg-white px-3 py-2 text-center font-bold">
                ΚΩΔΙΚΑΣ
              </th>
              <th colSpan={6} className="border border-slate-400 bg-white px-3 py-2 text-center font-bold">
                ΕΠΙΠΕΔΟ ΑΝΑΛΥΣΗΣ
              </th>
              <th rowSpan={4} className="border border-slate-400 bg-white px-3 py-2 text-center font-bold">
                ΤΙΤΛΟΣ ΣΤΟΙΧΕΙΟΥ ΚΟΣΤΟΥΣ
              </th>
              <th
                colSpan={section.moires.reduce((count, moira) => count + moira.ales.length + 1, 0)}
                className="border border-slate-400 bg-white px-3 py-2 text-center font-bold"
              >
                Κόστος Οδοιπορικών Μετασταθμεύσεων
              </th>
            </tr>
            <tr>
              {Array.from({ length: 6 }).map((_, index) => (
                <th
                  key={`top-analysis-${index + 1}`}
                  rowSpan={3}
                  className="border border-slate-400 bg-slate-50 px-2 py-2 text-center font-bold"
                >
                  {index + 1}
                </th>
              ))}

              {section.moires.map((moira) => (
                <th
                  key={`top-moira-${moira.id}`}
                  colSpan={moira.ales.length + 1}
                  className="border border-slate-400 bg-slate-50 px-3 py-2 text-center font-bold uppercase"
                >
                  {moira.label}
                </th>
              ))}
            </tr>
            <tr>
              {section.moires.flatMap((moira) => [
                <th
                  key={`top-moira-ale-${moira.id}`}
                  colSpan={moira.ales.length}
                  className="border border-slate-400 bg-slate-100 px-3 py-2 text-center font-bold uppercase"
                >
                  ΑΛΕ
                </th>,
                <th
                  key={`top-moira-syn-${moira.id}`}
                  rowSpan={2}
                  className="border border-slate-400 bg-orange-100 px-3 py-2 text-center font-bold"
                >
                  ΣΥΝ
                </th>,
              ])}
            </tr>
            <tr>
              {section.moires.flatMap((moira) =>
                moira.ales.map((ale) => (
                  <th
                    key={`top-ale-${moira.id}-${ale.id}`}
                    className="border border-slate-400 bg-white px-3 py-2 text-center font-semibold"
                  >
                    {ale.code}
                  </th>
                )),
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={`top-row-${row.id}`} className="bg-white">
                <td className="border border-slate-300 px-3 py-2 text-center font-semibold">{row.code}</td>

                {Array.from({ length: 6 }).map((_, index) => (
                  <td
                    key={`top-${row.id}-analysis-${index + 1}`}
                    className="border border-slate-300 px-1 py-2 text-center font-bold text-slate-700"
                  >
                    {row.analysisLevel === index + 1 ? 'x' : ''}
                  </td>
                ))}

                <td className="border border-slate-300 px-2 py-2 text-[11px] leading-tight">
                  {row.costElementTitle}
                </td>

                {section.moires.flatMap((moira) => [
                  ...moira.ales.map((ale) => (
                    <td
                      key={`top-${row.id}-${moira.id}-${ale.id}`}
                      className="border border-slate-300 px-2 py-1.5 text-right"
                    >
                      {formatAmount(row.values[getAmountKey(moira.id, ale.id)] ?? 0)}
                    </td>
                  )),
                  <td
                    key={`top-${row.id}-${moira.id}-syn`}
                    className="border border-slate-300 bg-orange-50 px-3 py-2 text-right font-bold text-slate-800"
                  >
                    {formatAmount(calculateRowTotal(row, [moira]))}
                  </td>,
                ])}
              </tr>
            ))}

            <tr className="bg-amber-100">
              <td
                colSpan={8}
                className="border border-slate-400 px-3 py-3 text-right font-bold uppercase tracking-wide"
              >
                ΣΥΝ ΣΤΗΛ
              </td>

              {section.moires.flatMap((moira) => [
                ...moira.ales.map((ale) => (
                  <td
                    key={`top-sum-${moira.id}-${ale.id}`}
                    className="border border-slate-400 px-3 py-3 text-right font-bold"
                  >
                    {formatAmount(calculateAleColumnTotal(moira.id, ale.id, rows))}
                  </td>
                )),
                <td
                  key={`top-sum-${moira.id}-syn`}
                  className="border border-slate-400 bg-orange-200 px-3 py-3 text-right font-extrabold"
                >
                  {formatAmount(calculateMoiraTotal(moira, rows))}
                </td>,
              ])}
            </tr>

            <tr className="bg-orange-50">
              <td
                colSpan={8}
                className="border border-slate-400 px-3 py-3 text-right font-bold uppercase tracking-wide"
              >
                Σύνολο 1Α
              </td>

              <td
                colSpan={section.moires.reduce((count, moira) => count + moira.ales.length, 0)}
                className="border border-slate-400 px-3 py-3 text-right font-semibold text-slate-700"
              >
                Συνολική πρόσθεση των πορτοκαλί κελιών
              </td>

              <td
                colSpan={section.moires.length}
                className="border border-slate-400 bg-orange-300 px-3 py-3 text-right font-extrabold text-slate-900"
              >
                {formatAmount(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
        <table className="w-full table-fixed border-collapse text-[11px] text-slate-800">
          <colgroup>
            <col className="w-24" />
            {Array.from({ length: 6 }).map((_, index) => (
              <col key={`analysis-col-${index + 1}`} className="w-7" />
            ))}
            <col className="w-56" />
            {reviewAleColumns.map((ale) => (
              <col key={`review-ale-${ale.id}`} className="w-20" />
            ))}
            <col className="w-20" />
          </colgroup>

          <thead>
            <tr>
              <th
                colSpan={8 + reviewAleColumns.length}
                className="border border-slate-400 bg-slate-200 px-4 py-3 text-center text-sm font-bold uppercase tracking-wide"
              >
                ΤΕΛΙΚΗ ΣΥΝΟΨΗ
              </th>
            </tr>
            <tr>
              <th
                colSpan={8 + reviewAleColumns.length}
                className="border border-slate-400 bg-white px-4 py-3 text-center font-bold uppercase tracking-wide"
              >
                {section.sectionTitle}
              </th>
            </tr>
            <tr>
              <th rowSpan={4} className="border border-slate-400 bg-white px-3 py-2 text-center font-bold">
                ΚΩΔΙΚΑΣ
              </th>
              <th colSpan={6} className="border border-slate-400 bg-white px-3 py-2 text-center font-bold">
                ΕΠΙΠΕΔΟ ΑΝΑΛΥΣΗΣ
              </th>
              <th rowSpan={4} className="border border-slate-400 bg-white px-3 py-2 text-center font-bold">
                ΤΙΤΛΟΣ ΣΤΟΙΧΕΙΟΥ ΚΟΣΤΟΥΣ
              </th>
              <th
                colSpan={reviewAleColumns.length + 1}
                className="border border-slate-400 bg-white px-3 py-2 text-center font-bold"
              >
                Κόστος Οδοιπορικών Μετασταθμεύσεων
              </th>
            </tr>
            <tr>
              {Array.from({ length: 6 }).map((_, index) => (
                <th
                  key={`analysis-${index + 1}`}
                  rowSpan={3}
                  className="border border-slate-400 bg-slate-50 px-2 py-2"
                >
                  {index + 1}
                </th>
              ))}
              <th
                colSpan={reviewAleColumns.length + 1}
                className="border border-slate-400 bg-slate-50 px-3 py-2 text-center font-bold uppercase"
              >
                ΑΛΕ
              </th>
            </tr>
            <tr>
              {reviewAleColumns.map((ale) => (
                <th
                  key={`review-ale-code-${ale.id}`}
                  rowSpan={2}
                  className="border border-slate-400 bg-white px-3 py-2 text-center font-semibold"
                >
                  {ale.code}
                </th>
              ))}
              <th rowSpan={2} className="border border-slate-400 bg-orange-100 px-3 py-2 text-center font-bold">
                ΣΥΝ
              </th>
            </tr>
            <tr />
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="border border-slate-300 px-3 py-2 text-center font-semibold">{row.code}</td>

                {Array.from({ length: 6 }).map((_, index) => (
                  <td
                    key={`${row.id}-analysis-${index + 1}`}
                    className="border border-slate-300 px-1 py-2 text-center text-[11px] font-bold text-slate-700"
                  >
                    {row.analysisLevel === index + 1 ? 'X' : ''}
                  </td>
                ))}

                <td className="border border-slate-300 px-2 py-2 text-[11px] leading-tight">
                  {row.costElementTitle}
                </td>

                {reviewAleColumns.map((ale) => (
                  <td
                    key={`${row.id}-review-${ale.id}`}
                    className="border border-slate-300 px-2 py-1.5 text-right"
                  >
                    {formatAmount(calculateReviewCellValue(row, ale, section.moires))}
                  </td>
                ))}

                <td className="border border-slate-300 bg-orange-50 px-3 py-2 text-right font-bold text-slate-800">
                  {formatAmount(calculateReviewRowTotal(row, reviewAleColumns, section.moires))}
                </td>
              </tr>
            ))}

            <tr className="bg-amber-100">
              <td
                colSpan={8}
                className="border border-slate-400 px-3 py-3 text-right font-bold uppercase tracking-wide"
              >
                ΣΥΝ ΣΤΗΛ
              </td>

              {reviewAleColumns.map((ale) => (
                <td
                  key={`review-sum-${ale.id}`}
                  className="border border-slate-400 px-3 py-3 text-right font-bold"
                >
                  {formatAmount(calculateReviewAleColumnTotal(ale, rows, section.moires))}
                </td>
              ))}

              <td className="border border-slate-400 bg-orange-200 px-3 py-3 text-right font-extrabold">
                {formatAmount(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:border-slate-400 hover:bg-slate-50 hover:shadow"
        >
          Πίσω στις Μοίρες
        </button>
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1"
        >
          Αποθήκευση
        </button>
      </div>

      {isConfirmOpen && (
        <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded bg-white p-6">
            <h3 className="mb-2 text-lg font-bold">Επιβεβαίωση Αποθήκευσης</h3>
            <p className="mb-4 text-sm text-slate-700">
              Έλεγξε πρώτα τον συγκεντρωτικό πίνακα μοιρών και τον τελικό πίνακα. Αν όλα είναι σωστά,
              πάτησε επιβεβαίωση για να καταχωρηθούν.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:border-slate-400 hover:bg-slate-50 hover:shadow"
              >
                Ακύρωση
              </button>
              <button
                type="button"
                onClick={() => {
                  onSave();
                  setIsConfirmOpen(false);
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1"
              >
                Επιβεβαίωση και Αποθήκευση
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ypodeigma2ReviewTable;
