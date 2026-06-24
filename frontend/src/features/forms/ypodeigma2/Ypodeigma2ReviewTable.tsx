import { useMemo, useState, type FC } from 'react';
import { calculateGrandTotal, getAmountKey } from './helpers';
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

function calculateMoiraAleTotal(moira: Ypodeigma2Moira, ale: Ypodeigma2Ale, rows: Ypodeigma2Row[]) {
  const matchingAle = moira.ales.find((candidate) => candidate.displayOrder === ale.displayOrder);

  if (!matchingAle) {
    return 0;
  }

  return rows.reduce((total, row) => total + (row.values[getAmountKey(moira.id, matchingAle.id)] ?? 0), 0);
}

function calculateMoiraTotal(moira: Ypodeigma2Moira, rows: Ypodeigma2Row[]) {
  return moira.ales.reduce(
    (aleTotal, ale) => aleTotal + rows.reduce((rowTotal, row) => rowTotal + (row.values[getAmountKey(moira.id, ale.id)] ?? 0), 0),
    0,
  );
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

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="mb-2 text-lg font-bold">Προεπισκόπηση Αποθήκευσης - Υπόδειγμα 2</h2>
        <p className="text-sm text-slate-600">
          Πρώτα ελέγχεις τα σύνολα ανά μοίρα και μετά τον τελικό συγκεντρωτικό πίνακα πριν την οριστική αποθήκευση.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
        <div className="border-b border-slate-300 bg-slate-200 px-4 py-3 text-sm font-bold uppercase tracking-wide text-slate-800">
          Συγκεντρωτικός Πίνακας Μοιρών
        </div>

        <table className="w-full table-fixed border-collapse text-[11px] text-slate-800">
          <colgroup>
            <col className="w-32" />
            {reviewAleColumns.map((ale) => (
              <col key={`summary-ale-${ale.id}`} className="w-20" />
            ))}
            <col className="w-24" />
          </colgroup>

          <thead>
            <tr>
              <th className="border border-slate-400 bg-white px-3 py-2 text-center font-bold">ΜΟΙΡΑ</th>
              {reviewAleColumns.map((ale) => (
                <th
                  key={`summary-head-${ale.id}`}
                  className="border border-slate-400 bg-white px-3 py-2 text-center font-bold"
                >
                  {ale.code}
                </th>
              ))}
              <th className="border border-slate-400 bg-orange-100 px-3 py-2 text-center font-bold">ΣΥΝ</th>
            </tr>
          </thead>

          <tbody>
            {section.moires.map((moira) => (
              <tr key={`summary-row-${moira.id}`} className="bg-white">
                <td className="border border-slate-300 px-3 py-2 text-center font-semibold">{moira.label}</td>

                {reviewAleColumns.map((ale) => (
                  <td
                    key={`summary-${moira.id}-${ale.id}`}
                    className="border border-slate-300 px-2 py-2 text-right"
                  >
                    {formatAmount(calculateMoiraAleTotal(moira, ale, rows))}
                  </td>
                ))}

                <td className="border border-slate-300 bg-orange-50 px-3 py-2 text-right font-bold text-slate-800">
                  {formatAmount(calculateMoiraTotal(moira, rows))}
                </td>
              </tr>
            ))}

            <tr className="bg-amber-100">
              <td className="border border-slate-400 px-3 py-3 text-right font-bold uppercase tracking-wide">
                ΣΥΝ ΣΤΗΛ
              </td>

              {reviewAleColumns.map((ale) => (
                <td
                  key={`summary-total-${ale.id}`}
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
        <button type="button" onClick={onBack} className="rounded border px-3 py-2 text-sm">
          Πίσω στις Μοίρες
        </button>
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className="rounded bg-emerald-600 px-3 py-2 text-sm text-white"
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
                className="rounded border px-3 py-2 text-sm"
              >
                Ακύρωση
              </button>
              <button
                type="button"
                onClick={() => {
                  onSave();
                  setIsConfirmOpen(false);
                }}
                className="rounded bg-emerald-600 px-3 py-2 text-sm text-white"
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
