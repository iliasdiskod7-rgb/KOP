import type { FC } from 'react';
import { calculateAleColumnTotal, calculateGrandTotal, calculateRowTotal, getAmountKey } from './helpers';
import type { Ypodeigma2Row, Ypodeigma2SectionConfig } from './types';

function formatAmount(value: number) {
  return new Intl.NumberFormat('el-GR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

type Props = {
  rows: Ypodeigma2Row[];
  section: Ypodeigma2SectionConfig;
  onBack: () => void;
  onSave: () => void;
};

const Ypodeigma2ReviewTable: FC<Props> = ({ rows, section, onBack, onSave }) => {
  const grandTotal = calculateGrandTotal(rows, section.moires);

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-bold">Τελική Σύνοψη — Υπόδειγμα 2</h2>

      <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
        <table className="w-full table-fixed border-collapse text-[11px] text-slate-800">
          <colgroup>
            <col className="w-24" />
            <col />
            <col />
            {section.moires.flatMap((moira) =>
              moira.ales.map((ale) => <col key={`${moira.id}-${ale.id}`} />),
            )}
            <col />
          </colgroup>

          <thead>
            <tr>
              <th
                colSpan={9 + section.moires.reduce((c, m) => c + m.ales.length, 0)}
                className="border border-slate-400 bg-slate-200 px-4 py-3 text-center text-sm font-bold uppercase tracking-wide"
              >
                ΤΕΛΙΚΗ ΣΥΝΟΨΗ
              </th>
            </tr>
            <tr>
              <th
                colSpan={9 + section.moires.reduce((c, m) => c + m.ales.length, 0)}
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
                colSpan={section.moires.reduce((c, m) => c + m.ales.length, 0)}
                className="border border-slate-400 bg-white px-3 py-2 text-center font-bold"
              >
                Κόστος Οδοιπορικών Μετασταθμεύσεων
              </th>

              <th rowSpan={3} className="border border-slate-400 bg-orange-100 px-3 py-2 text-center font-bold">
                ΣΥΝ
              </th>
            </tr>
            <tr>
              {Array.from({ length: 6 }).map((_, i) => (
                <th key={`a-${i}`} rowSpan={3} className="border border-slate-400 bg-slate-50 px-2 py-2">
                  {i + 1}
                </th>
              ))}

              {section.moires.map((moira) => (
                <th
                  key={`m-${moira.id}`}
                  colSpan={moira.ales.length}
                  className="border border-slate-400 bg-slate-50 px-3 py-2 text-center font-bold uppercase"
                >
                  {moira.label}
                </th>
              ))}
            </tr>
            <tr>
              {section.moires.map((moira) => (
                <th
                  key={`m-ale-${moira.id}`}
                  colSpan={moira.ales.length}
                  className="border border-slate-400 bg-slate-100 px-3 py-2 text-center font-bold uppercase"
                >
                  ΑΛΕ
                </th>
              ))}
            </tr>
            <tr>
              {section.moires.flatMap((moira) =>
                moira.ales.map((ale) => (
                  <th
                    key={`ale-${moira.id}-${ale.id}`}
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
              <tr key={row.id} className="bg-white">
                <td className="border border-slate-300 px-3 py-2 text-center font-semibold">{row.code}</td>

                <td colSpan={6} className="border border-slate-300 px-1 py-2 text-[11px] leading-tight">
                  {row.analysisLevel}
                </td>

                <td className="border border-slate-300 px-2 py-2 text-[11px] leading-tight">{row.costElementTitle}</td>

                {section.moires.flatMap((moira) =>
                  moira.ales.map((ale) => (
                    <td key={`${row.id}-${moira.id}-${ale.id}`} className="border border-slate-300 px-2 py-1.5 text-right">
                      {formatAmount(row.values[getAmountKey(moira.id, ale.id)] ?? 0)}
                    </td>
                  )),
                )}

                <td className="border border-slate-300 bg-orange-50 px-3 py-2 text-right font-bold text-slate-800">
                  {formatAmount(calculateRowTotal(row, section.moires))}
                </td>
              </tr>
            ))}

            <tr className="bg-amber-100">
              <td colSpan={8} className="border border-slate-400 px-3 py-3 text-right font-bold uppercase tracking-wide">
                ΣΥΝ ΣΤΗΛ
              </td>

              {section.moires.flatMap((moira) =>
                moira.ales.map((ale) => (
                  <td key={`sum-${moira.id}-${ale.id}`} className="border border-slate-400 px-3 py-3 text-right font-bold">
                    {formatAmount(calculateAleColumnTotal(moira.id, ale.id, rows))}
                  </td>
                )),
              )}

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
        <button type="button" onClick={onSave} className="rounded bg-emerald-600 px-3 py-2 text-sm text-white">
          Αποθήκευση
        </button>
      </div>
    </div>
  );
};

export default Ypodeigma2ReviewTable;
