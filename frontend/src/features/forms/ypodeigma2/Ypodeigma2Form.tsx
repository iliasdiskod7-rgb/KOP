import { useEffect, useMemo, useState } from 'react';
import {
  calculateAleColumnTotal,
  calculateGrandTotal,
  calculateRowTotal,
  getAmountKey,
} from './helpers';
import { fetchYpodeigma2Section } from './mockYpodeigma2Api';
import type { Ypodeigma2Moira, Ypodeigma2Row, Ypodeigma2SectionConfig } from './types';

const ANALYSIS_COLUMNS = [1, 2, 3, 4, 5, 6];

function formatAmount(value: number) {
  return new Intl.NumberFormat('el-GR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function sortMoires(moires: Ypodeigma2Moira[]) {
  return [...moires].sort((left, right) => left.displayOrder - right.displayOrder);
}

function sortRows(rows: Ypodeigma2Row[]) {
  return [...rows].sort((left, right) => left.displayOrder - right.displayOrder);
}

export default function Ypodeigma2Form() {
  const [section, setSection] = useState<Ypodeigma2SectionConfig | null>(null);
  // Τοπικό editable αντίγραφο των rows του backend μέχρι να συνδεθούν τα save/load endpoints.
  const [rows, setRows] = useState<Ypodeigma2Row[]>([]);

  useEffect(() => {
    let mounted = true;

    // Το section id αργότερα πιθανότατα θα έρχεται από backend metadata ή από route params.
    fetchYpodeigma2Section('1Α').then((config) => {
      if (!mounted) {
        return;
      }

      const sortedMoires = sortMoires(config.moires).map((moira) => ({
        ...moira,
        ales: [...moira.ales].sort((left, right) => left.displayOrder - right.displayOrder),
      }));

      const sortedRows = sortRows(config.rows);

      setSection({
        ...config,
        moires: sortedMoires,
        rows: sortedRows,
      });
      setRows(sortedRows);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const totalAleCount = useMemo(
    () => section?.moires.reduce((count, moira) => count + moira.ales.length, 0) ?? 0,
    [section],
  );

  const gridTemplateColumns = useMemo(() => {
    if (!section) {
      return '';
    }

    const leftColumns = [
      'minmax(7rem, 0.95fr)',
      ...ANALYSIS_COLUMNS.map(() => 'minmax(3rem, 0.58fr)'),
      'minmax(18rem, 2fr)',
    ];
    const amountColumns = section.moires.flatMap((moira) =>
      moira.ales.map(() => 'minmax(7rem, 0.8fr)'),
    );

    return [...leftColumns, ...amountColumns, 'minmax(7rem, 0.85fr)'].join(' ');
  }, [section]);

  if (!section) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-600">Φόρτωση διάταξης Υποδείγματος 2...</p>
      </div>
    );
  }

  const handleAmountChange = (rowId: Ypodeigma2Row['id'], amountKey: string, rawValue: string) => {
    // Όταν υλοποιηθεί το save, αυτό είναι το state shape που θα πρέπει να σταλεί πίσω στο backend.
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        return {
          ...row,
          values: {
            ...row.values,
            [amountKey]: rawValue === '' ? null : Number(rawValue),
          },
        };
      }),
    );
  };

  const grandTotal = calculateGrandTotal(rows, section.moires);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Υπόδειγμα 2</h1>
            <p className="text-sm text-slate-600">{section.sectionTitle}</p>
          </div>
          <div className="rounded-xl bg-slate-100 px-4 py-3 text-right text-xs font-semibold text-slate-600">
            <div>Μοίρες / Μονάδες: {section.moires.length}</div>
            <div>Συνολικές στήλες ΑΛΕ: {totalAleCount}</div>
            <div>Γραμμές στοιχείων κόστους: {rows.length}</div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-300 bg-slate-50">
          <table className="min-w-max border-collapse text-xs text-slate-800" style={{ gridTemplateColumns }}>
            <colgroup>
              <col className="w-28" />
              {ANALYSIS_COLUMNS.map((column) => (
                <col key={`analysis-col-${column}`} className="w-12" />
              ))}
              <col className="w-80" />
              {section.moires.flatMap((moira) =>
                moira.ales.map((ale) => <col key={`${moira.id}-${ale.id}`} className="w-28" />),
              )}
              <col className="w-28" />
            </colgroup>

            <thead>
              <tr>
                <th
                  colSpan={9 + totalAleCount}
                  className="border border-slate-400 bg-slate-200 px-4 py-3 text-center text-sm font-bold uppercase tracking-wide"
                >
                  ΥΠΟΔΕΙΓΜΑ 2
                </th>
              </tr>
              <tr>
                <th
                  colSpan={9 + totalAleCount}
                  className="border border-slate-400 bg-white px-4 py-3 text-center font-bold uppercase tracking-wide"
                >
                  {section.sectionTitle}
                </th>
              </tr>
              <tr>
                {/* Το αριστερό block είναι σταθερό, ενώ οι στήλες ποσών χτίζονται δυναμικά από τα moires[].ales. */}
                <th rowSpan={4} className="border border-slate-400 bg-white px-3 py-2 text-center font-bold">
                  ΚΩΔΙΚΑΣ
                </th>
                <th
                  colSpan={ANALYSIS_COLUMNS.length}
                  className="border border-slate-400 bg-white px-3 py-2 text-center font-bold"
                >
                  ΕΠΙΠΕΔΟ ΑΝΑΛΥΣΗΣ
                </th>
                <th rowSpan={4} className="border border-slate-400 bg-white px-3 py-2 text-center font-bold">
                  ΤΙΤΛΟΣ ΣΤΟΙΧΕΙΟΥ ΚΟΣΤΟΥΣ
                </th>
                <th
                  colSpan={totalAleCount + 1}
                  className="border border-slate-400 bg-white px-3 py-2 text-center font-bold"
                >
                  Κόστος Οδοιπορικών Μετασταθμεύσεων
                </th>
              </tr>
              <tr>
                {ANALYSIS_COLUMNS.map((column) => (
                  <th
                    key={`analysis-${column}`}
                    rowSpan={3}
                    className="border border-slate-400 bg-slate-50 px-2 py-2"
                  >
                    {column}
                  </th>
                ))}
                {section.moires.map((moira, index) => (
                  <th
                    key={`moira-${moira.id}`}
                    colSpan={moira.ales.length + (index === section.moires.length - 1 ? 1 : 0)}
                    className="border border-slate-400 bg-slate-50 px-3 py-2 text-center font-bold uppercase"
                  >
                    {moira.label}
                  </th>
                ))}
              </tr>
              <tr>
                {section.moires.map((moira) => (
                  <th
                    key={`moira-ale-${moira.id}`}
                    colSpan={moira.ales.length}
                    className="border border-slate-400 bg-slate-100 px-3 py-2 text-center font-bold uppercase"
                  >
                    ΑΛΕ
                  </th>
                ))}
                <th rowSpan={2} className="border border-slate-400 bg-orange-100 px-3 py-2 text-center font-bold">
                  ΣΥΝ
                </th>
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

                  {ANALYSIS_COLUMNS.map((level) => (
                    <td
                      key={`${row.id}-analysis-${level}`}
                      className="border border-slate-300 px-2 py-2 text-center text-sm font-bold text-slate-700"
                    >
                      {row.analysisLevel === level ? 'X' : ''}
                    </td>
                  ))}

                  <td className="border border-slate-300 px-3 py-2 text-sm">{row.costElementTitle}</td>

                  {section.moires.flatMap((moira) =>
                    moira.ales.map((ale) => {
                      // Το amountKey συνδέει κάθε input με τον συνδυασμό row id + moira id + ALE id του backend.
                      const amountKey = getAmountKey(moira.id, ale.id);
                      const value = row.values[amountKey];

                      return (
                        <td
                          key={`${row.id}-${amountKey}`}
                          className="border border-slate-300 bg-white px-2 py-1.5"
                        >
                          <input
                            type="number"
                            value={value ?? ''}
                            onChange={(event) =>
                              handleAmountChange(row.id, amountKey, event.target.value)
                            }
                            className="w-full bg-transparent text-right outline-none focus:bg-cyan-50"
                          />
                        </td>
                      );
                    }),
                  )}

                  <td className="border border-slate-300 bg-orange-50 px-3 py-2 text-right font-bold text-slate-800">
                    {formatAmount(calculateRowTotal(row, section.moires))}
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

                {section.moires.flatMap((moira) =>
                  moira.ales.map((ale) => (
                    <td
                      key={`sum-${moira.id}-${ale.id}`}
                      className="border border-slate-400 px-3 py-3 text-right font-bold"
                    >
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

        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          <p>
            Το schema είναι πλέον backend-driven μέσω `moires`, `ales` και `rows`. Αν αλλάξεις τα
            `ales.length` στο mock API, ο πίνακας μεγαλώνει μόνος του χωρίς επιπλέον hardcoding.
          </p>
        </div>
      </div>
    </section>
  );
}
