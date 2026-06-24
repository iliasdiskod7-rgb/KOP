import { useEffect, useMemo, useState } from 'react';
import {
  calculateAleColumnTotal,
  calculateGrandTotal,
  calculateRowTotal,
  getAmountKey,
} from './helpers';
import Ypodeigma2ReviewTable from './Ypodeigma2ReviewTable';
import { fetchYpodeigma2Section } from './mockYpodeigma2Api';
import type { Ypodeigma2Moira, Ypodeigma2Row, Ypodeigma2SectionConfig } from './types';

const ANALYSIS_COLUMNS = [1, 2, 3, 4, 5, 6];

function formatAmount(value: number) {
  return new Intl.NumberFormat('el-GR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function parseAmount(rawValue: string): number | null {
  if (rawValue.trim() === '') {
    return null;
  }

  const normalizedValue = rawValue.replace(',', '.');
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
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
  const [currentMoiraIndex, setCurrentMoiraIndex] = useState<number>(0);
  const [step, setStep] = useState<'moira-entry' | 'review'>('moira-entry');

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

    const currentMoira = section.moires[currentMoiraIndex];
    const currentMoires = currentMoira ? [currentMoira] : [];
    const visibleMoires = step === 'moira-entry' ? currentMoires : section.moires;

    const leftColumns = [
      'minmax(6.5rem, 0.9fr)',
      ...ANALYSIS_COLUMNS.map(() => 'minmax(1.8rem, 0.28fr)'),
      'minmax(14rem, 1.8fr)',
    ];
    const amountColumns = visibleMoires.flatMap((moira) =>
      moira.ales.map(() => 'minmax(5.5rem, 0.7fr)'),
    );

    return [...leftColumns, ...amountColumns, 'minmax(5.75rem, 0.75fr)'].join(' ');
  }, [section, currentMoiraIndex, step]);

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
            [amountKey]: parseAmount(rawValue),
          },
        };
      }),
    );
  };

  

  const currentMoira = section.moires[currentMoiraIndex];
  const currentMoires = currentMoira ? [currentMoira] : [];
  const visibleMoires = step === 'moira-entry' ? currentMoires : section.moires;

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

        <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
          {step === 'moira-entry' ? (
            <table className="w-full table-fixed border-collapse text-[11px] text-slate-800" style={{ gridTemplateColumns }}>
              <colgroup>
                <col className="w-24" />
                {ANALYSIS_COLUMNS.map((column) => (
                  <col key={`analysis-col-${column}`} className="w-7" />
                ))}
                <col className="w-56" />
                {visibleMoires.flatMap((moira) =>
                  moira.ales.map((ale) => <col key={`${moira.id}-${ale.id}`} className="w-20" />),
                )}
                <col className="w-20" />
              </colgroup>

              <thead>
                <tr>
                  <th
                    colSpan={9 + visibleMoires.reduce((c, m) => c + m.ales.length, 0)}
                    className="border border-slate-400 bg-slate-200 px-4 py-3 text-center text-sm font-bold uppercase tracking-wide"
                  >
                    ΥΠΟΔΕΙΓΜΑ 2
                  </th>
                </tr>
                <tr>
                  <th
                    colSpan={9 + visibleMoires.reduce((c, m) => c + m.ales.length, 0)}
                    className="border border-slate-400 bg-white px-4 py-3 text-center font-bold uppercase tracking-wide"
                  >
                    {section.sectionTitle}
                  </th>
                </tr>
                <tr>
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
                    colSpan={visibleMoires.reduce((c, m) => c + m.ales.length, 0)}
                    className="border border-slate-400 bg-white px-3 py-2 text-center font-bold"
                  >
                    Κόστος Οδοιπορικών Μετασταθμεύσεων
                  </th>
                  <th rowSpan={3} className="border border-slate-400 bg-orange-100 px-3 py-2 text-center font-bold">
                    ΣΥΝ
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
                  {visibleMoires.map((moira) => (
                    <th
                      key={`moira-${moira.id}`}
                      colSpan={moira.ales.length}
                      className="border border-slate-400 bg-slate-50 px-3 py-2 text-center font-bold uppercase"
                    >
                      {moira.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  {visibleMoires.map((moira) => (
                    <th
                      key={`moira-ale-${moira.id}`}
                      colSpan={moira.ales.length}
                      className="border border-slate-400 bg-slate-100 px-3 py-2 text-center font-bold uppercase"
                    >
                      ΑΛΕ
                    </th>
                  ))}
                </tr>
                <tr>
                  {visibleMoires.flatMap((moira) =>
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
                        className="border border-slate-300 px-1 py-2 text-center text-[11px] font-bold text-slate-700"
                      >
                        {row.analysisLevel === level ? 'X' : ''}
                      </td>
                    ))}

                    <td className="border border-slate-300 px-2 py-2 text-[11px] leading-tight">{row.costElementTitle}</td>

                    {visibleMoires.flatMap((moira) =>
                      moira.ales.map((ale) => {
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
                              onChange={(event) => handleAmountChange(row.id, amountKey, event.target.value)}
                              className="w-full appearance-none bg-transparent text-right text-[11px] outline-none focus:bg-cyan-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                          </td>
                        );
                      }),
                    )}

                    <td className="border border-slate-300 bg-orange-50 px-3 py-2 text-right font-bold text-slate-800">
                      {formatAmount(calculateRowTotal(row, visibleMoires))}
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

                  {visibleMoires.flatMap((moira) =>
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
                    {formatAmount(calculateGrandTotal(rows, section.moires))}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <Ypodeigma2ReviewTable
              rows={rows}
              section={section}
              onBack={() => setStep('moira-entry')}
              onSave={() => {
                const payload = {
                  sectionId: section.sectionId,
                  amounts: rows.flatMap((row) =>
                    section.moires.flatMap((moira) =>
                      moira.ales.map((ale) => ({
                        rowId: row.id,
                        moiraId: moira.id,
                        aleId: ale.id,
                        amount: row.values[getAmountKey(moira.id, ale.id)] ?? null,
                      })),
                    ),
                  ),
                };

                // Пока что απλά log για έλεγχο.
                // Στο μέλλον θα κάνουμε POST στο backend.
                // eslint-disable-next-line no-console
                console.log('Save payload', payload);
              }}
            />
          )}
        </div>

        {step === 'moira-entry' && (
          <div className="mt-4 flex items-center justify-between">
            <div>
              <button
                type="button"
                onClick={() => setCurrentMoiraIndex((i) => Math.max(0, i - 1))}
                disabled={currentMoiraIndex === 0}
                className="rounded border px-3 py-2 text-sm"
              >
                Προηγούμενη Μοίρα
              </button>
            </div>

            <div className="text-sm font-medium">
              Μοίρα {currentMoiraIndex + 1} από {section.moires.length}: {currentMoira?.label}
            </div>

            <div>
              {currentMoiraIndex < section.moires.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentMoiraIndex((i) => Math.min(section.moires.length - 1, i + 1))}
                  className="rounded bg-sky-600 px-3 py-2 text-sm text-white"
                >
                  Επόμενη Μοίρα
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="rounded bg-amber-600 px-3 py-2 text-sm text-white"
                >
                  Συνέχεια στον τελικό πίνακα
                </button>
              )}
            </div>
          </div>
        )}

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
