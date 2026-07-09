import type { FC } from 'react';
import { calculateRowAmount, getRowDepth, isLeafRow } from './helpers';
import type { Ypodeigma1MoiraCacheEntry, Ypodeigma1TableARow } from './types';

type Props = {
  entry: Ypodeigma1MoiraCacheEntry;
  isEditable: boolean;
  onAmountChange: (rowId: string, rawValue: string) => void;
};

const ANALYSIS_COLUMNS = [1, 2, 3, 4, 5, 6];

function formatEditableAmount(value: number | null) {
  if (value === null) {
    return '';
  }

  return String(value);
}

function formatReadonlyAmount(value: number) {
  return new Intl.NumberFormat('el-GR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function getAnalysisLevel(row: Ypodeigma1TableARow) {
  return row.analysisLevel ?? Math.min(getRowDepth(row.code) + 1, ANALYSIS_COLUMNS.length);
}

const Ypodeigma1Section1ATable: FC<Props> = ({ entry, isEditable, onAmountChange }) => {
  const leftColumnCount = 2 + ANALYSIS_COLUMNS.length;
  const totalColumnCount = leftColumnCount + 1;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-300 bg-slate-50">
      <table className="w-full table-fixed border-collapse text-[9px] text-slate-800">
        <colgroup>
          <col className="w-24" />
          {ANALYSIS_COLUMNS.map((column) => (
            <col key={`analysis-col-${column}`} className="w-7" />
          ))}
          <col className="w-64" />
          <col className="w-28" />
        </colgroup>

        <thead>
          <tr>
            <th
              colSpan={totalColumnCount}
              className="border border-slate-400 bg-slate-200 px-3 py-1.5 text-center text-[12px] font-bold"
            >
              ΥΠΟΔΕΙΓΜΑ 1-1Α
            </th>
          </tr>
          <tr>
            <th
              colSpan={totalColumnCount}
              className="border border-slate-400 bg-white px-3 py-1.5 text-center text-[10px] font-bold tracking-wide"
            >
              Μικτές Αποδοχές Πληρωμάτων Α/Φ και Προσωπικού Συντήρησης Μοιρών Α/Φ-Ε/Π
            </th>
          </tr>
          <tr>
            <th rowSpan={2} className="border border-slate-400 bg-white px-2 py-1 text-center font-bold">
              ΚΩΔΙΚΑΣ
            </th>
            <th
              colSpan={ANALYSIS_COLUMNS.length}
              className="border border-slate-400 bg-white px-2 py-1 text-center font-bold"
            >
              ΕΠΙΠΕΔΟ ΑΝΑΛΥΣΗΣ
            </th>
            <th rowSpan={2} className="border border-slate-400 bg-white px-2 py-1 text-center font-bold">
              ΤΙΤΛΟΣ ΣΤΟΙΧΕΙΟΥ ΚΟΣΤΟΥΣ
            </th>
            <th className="border border-slate-400 bg-white px-2 py-1 text-center font-bold">
              Κόστος Μικτών Αποδοχών
            </th>
          </tr>
          <tr>
            {ANALYSIS_COLUMNS.map((column) => (
              <th
                key={`analysis-${column}`}
                className="border border-slate-400 bg-slate-50 px-1 py-1 text-center font-bold"
              >
                {column}
              </th>
            ))}
            <th className="border border-slate-400 bg-slate-50 px-2 py-1 text-center font-bold uppercase">
              {entry.moiraLabel}
            </th>
          </tr>
        </thead>

        <tbody>
          {entry.table1ARows.map((row) => {
            const depth = getRowDepth(row.code);
            const leafRow = isLeafRow(row, entry.table1ARows);
            const calculatedAmount = calculateRowAmount(row, entry.table1ARows);

            return (
              <tr key={row.id} className={leafRow ? 'bg-white' : 'bg-sky-50'}>
                <td className="border border-slate-300 px-2 py-1 text-center font-semibold">{row.code}</td>

                {ANALYSIS_COLUMNS.map((column) => (
                  <td
                    key={`${row.id}-analysis-${column}`}
                    className="border border-slate-300 px-0.5 py-1 text-center font-bold text-slate-700"
                  >
                    {getAnalysisLevel(row) === column ? 'x' : ''}
                  </td>
                ))}

                <td className="border border-slate-300 px-2 py-1">
                  <div style={{ paddingLeft: `${depth * 12}px` }}>{row.title}</div>
                </td>
                <td className={`border border-slate-300 px-1.5 py-1 ${leafRow ? 'bg-white' : 'bg-sky-100'}`}>
                  {leafRow ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formatEditableAmount(row.amount)}
                      onChange={(event) => onAmountChange(row.id, event.target.value)}
                      className={`w-full rounded-md border px-2 py-1 text-right text-[9px] outline-none transition ${
                        isEditable
                          ? 'border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
                          : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                      }`}
                      placeholder="0"
                      disabled={!isEditable}
                    />
                  ) : (
                    <div className="rounded-md bg-sky-100 px-2 py-1 text-right font-bold text-sky-900">
                      {formatReadonlyAmount(calculatedAmount)}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Ypodeigma1Section1ATable;
