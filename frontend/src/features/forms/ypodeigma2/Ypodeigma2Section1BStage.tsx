import type { FC } from 'react';
import { formatTitleCase, getAmountKey } from './helpers';
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

type Props = {
  rows: Ypodeigma2Row[];
  sectionId: string;
  sectionTitle: string;
  sharedConfig: Pick<Ypodeigma2SectionConfig, 'analysisLevels' | 'moires'>;
  onBack: () => void;
  onContinue: () => void;
};

const Ypodeigma2Section1BStage: FC<Props> = ({
  rows,
  sectionId,
  sectionTitle,
  sharedConfig,
  onBack,
  onContinue,
}) => {
  const reviewAleColumns = buildReviewAleColumns(sharedConfig.moires);
  const grandTotal = rows.reduce(
    (total, row) => total + calculateReviewRowTotal(row, reviewAleColumns, sharedConfig.moires),
    0,
  );
  const analysisLevels = [...sharedConfig.analysisLevels].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  );
  const leftColumnCount = 2 + analysisLevels.length;

  return (
    <div className="space-y-4 p-4">
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
        <table className="w-full table-fixed border-collapse text-[11px] text-slate-800">
          <colgroup>
            <col className="w-24" />
            {analysisLevels.map((level) => (
              <col key={`analysis-col-${level.id}`} className="w-7" />
            ))}
            <col className="w-56" />
            {reviewAleColumns.map((ale) => (
              <col key={`stage-ale-${ale.id}`} className="w-20" />
            ))}
            <col className="w-20" />
          </colgroup>

          <thead>
            <tr>
              <th
                colSpan={leftColumnCount + reviewAleColumns.length + 1}
                className="border border-slate-400 bg-slate-200 px-4 py-3 text-center text-sm font-bold tracking-wide"
              >
                ΥΠΟΔΕΙΓΜΑ 2- 1Β
              </th>
            </tr>
            <tr>
              <th
                colSpan={leftColumnCount + reviewAleColumns.length + 1}
                className="border border-slate-400 bg-white px-4 py-3 text-center font-bold tracking-wide"
              >
                {formatTitleCase(sectionTitle)}
              </th>
            </tr>
            <tr>
              <th rowSpan={4} className="border border-slate-400 bg-white px-3 py-2 text-center font-bold">
                ΚΩΔΙΚΑΣ
              </th>
              <th
                colSpan={analysisLevels.length}
                className="border border-slate-400 bg-white px-3 py-2 text-center font-bold"
              >
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
              {analysisLevels.map((level) => (
                <th
                  key={`analysis-${level.id}`}
                  rowSpan={3}
                  className="border border-slate-400 bg-slate-50 px-2 py-2"
                >
                  {level.label}
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
                  key={`stage-ale-code-${ale.id}`}
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

                {analysisLevels.map((level) => (
                  <td
                    key={`${row.id}-analysis-${level.id}`}
                    className="border border-slate-300 px-1 py-2 text-center text-[11px] font-bold text-slate-700"
                  >
                    {row.analysisLevel === level.value ? 'X' : ''}
                  </td>
                ))}

                <td className="border border-slate-300 px-2 py-2 text-[11px] leading-tight">
                  {row.costElementTitle}
                </td>

                {reviewAleColumns.map((ale) => (
                  <td
                    key={`${row.id}-stage-${ale.id}`}
                    className="border border-slate-300 px-2 py-1.5 text-right"
                  >
                    {formatAmount(calculateReviewCellValue(row, ale, sharedConfig.moires))}
                  </td>
                ))}

                <td className="border border-slate-300 bg-orange-50 px-3 py-2 text-right font-bold text-slate-800">
                  {formatAmount(calculateReviewRowTotal(row, reviewAleColumns, sharedConfig.moires))}
                </td>
              </tr>
            ))}

            <tr className="bg-amber-100">
              <td
                colSpan={leftColumnCount}
                className="border border-slate-400 px-3 py-3 text-right font-bold uppercase tracking-wide"
              >
                ΣΥΝΟΛΟ {sectionId}
              </td>

              {reviewAleColumns.map((ale) => (
                <td
                  key={`stage-sum-${ale.id}`}
                  className="border border-slate-400 px-3 py-3 text-right font-bold"
                >
                  {formatAmount(calculateReviewAleColumnTotal(ale, rows, sharedConfig.moires))}
                </td>
              ))}

              <td className="border border-slate-400 bg-orange-200 px-3 py-3 text-right font-extrabold">
                {formatAmount(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:border-slate-400 hover:bg-slate-50 hover:shadow"
        >
          Πίσω στις Μοίρες
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-amber-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1"
        >
          Συνέχεια στο συγκεντρωτικό
        </button>
      </div>
    </div>
  );
};

export default Ypodeigma2Section1BStage;
