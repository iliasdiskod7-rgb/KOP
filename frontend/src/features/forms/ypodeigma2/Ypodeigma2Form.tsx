import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  calculateAleColumnTotal,
  calculateGrandTotal,
  calculateRowTotal,
  formatTitleCase,
  getAmountKey,
} from './helpers';
import { fetchYpodeigma2Section } from './mockYpodeigma2Api';
import Ypodeigma2ReviewTable from './Ypodeigma2ReviewTable';
import Ypodeigma2Section1BStage from './Ypodeigma2Section1BStage';
import { saveYpodeigma2Submission } from './submissionStorage';
import type {
  Ypodeigma2AnalysisLevel,
  Ypodeigma2Moira,
  Ypodeigma2Row,
  Ypodeigma2SectionConfig,
} from './types';

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

function sortAnalysisLevels(levels: Ypodeigma2AnalysisLevel[]) {
  return [...levels].sort((left, right) => left.displayOrder - right.displayOrder);
}

type FormStep = 'moira-entry' | 'section-1b' | 'review';

export default function Ypodeigma2Form() {
  const navigate = useNavigate();
  const [section, setSection] = useState<Ypodeigma2SectionConfig | null>(null);
  const [rows, setRows] = useState<Ypodeigma2Row[]>([]);
  const [section1BRows, setSection1BRows] = useState<Ypodeigma2Row[]>([]);
  const [currentMoiraIndex, setCurrentMoiraIndex] = useState<number>(0);
  const [step, setStep] = useState<FormStep>('moira-entry');

  useEffect(() => {
    let mounted = true;

    fetchYpodeigma2Section('1Α').then((config) => {
      if (!mounted) {
        return;
      }

      const sortedMoires = sortMoires(config.moires).map((moira) => ({
        ...moira,
        ales: [...moira.ales].sort((left, right) => left.displayOrder - right.displayOrder),
      }));

      const sortedRows = sortRows(config.rows);
      const sortedAnalysisLevels = sortAnalysisLevels(config.analysisLevels);

      setSection({
        ...config,
        analysisLevels: sortedAnalysisLevels,
        moires: sortedMoires,
        rows: sortedRows,
        section1B: {
          ...config.section1B,
          rows: sortRows(config.section1B.rows),
        },
      });
      setRows(sortedRows);
      setSection1BRows(sortRows(config.section1B.rows));
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
    const visibleMoires = currentMoira ? [currentMoira] : [];

    const leftColumns = [
      'minmax(6.5rem, 0.9fr)',
      ...section.analysisLevels.map(() => 'minmax(1.8rem, 0.28fr)'),
      'minmax(14rem, 1.8fr)',
    ];
    const amountColumns = visibleMoires.flatMap((moira) =>
      moira.ales.map(() => 'minmax(5.5rem, 0.7fr)'),
    );

    return [...leftColumns, ...amountColumns, 'minmax(5.75rem, 0.75fr)'].join(' ');
  }, [section, currentMoiraIndex]);

  if (!section) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-600">Φόρτωση διάταξης Υποδείγματος 2...</p>
      </div>
    );
  }

  const handleAmountChange = (rowId: Ypodeigma2Row['id'], amountKey: string, rawValue: string) => {
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
  const analysisLevels = section.analysisLevels;
  const leftColumnCount = 2 + analysisLevels.length;
  const currentMoiraTitle = currentMoira?.label ?? '';

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Υπόδειγμα 2</h1>
            <p className="text-sm text-slate-600">{formatTitleCase(section.sectionTitle)}</p>
          </div>
          <div className="rounded-xl bg-slate-100 px-4 py-3 text-right text-xs font-semibold text-slate-600">
            <div>Μοίρες / Μονάδες: {section.moires.length}</div>
            <div>Συνολικές στήλες ΑΛΕ: {totalAleCount}</div>
            <div>Γραμμές στοιχείων κόστους: {rows.length}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
          {step === 'moira-entry' ? (
            <table
              className="w-full table-fixed border-collapse text-[11px] text-slate-800"
              style={{ gridTemplateColumns }}
            >
              <colgroup>
                <col className="w-24" />
                {analysisLevels.map((level) => (
                  <col key={`analysis-col-${level.id}`} className="w-7" />
                ))}
                <col className="w-56" />
                {currentMoires.flatMap((moira) =>
                  moira.ales.map((ale) => <col key={`${moira.id}-${ale.id}`} className="w-20" />),
                )}
                <col className="w-20" />
              </colgroup>

              <thead>
                <tr>
                  <th
                    colSpan={
                      leftColumnCount + currentMoires.reduce((count, moira) => count + moira.ales.length, 0) + 1
                    }
                    className="border border-slate-400 bg-slate-200 px-4 py-3 text-center text-sm font-bold uppercase tracking-wide"
                  >
                    ΥΠΟΔΕΙΓΜΑ 2 - 1Α
                  </th>
                </tr>
                <tr>
                  <th
                    colSpan={
                      leftColumnCount + currentMoires.reduce((count, moira) => count + moira.ales.length, 0) + 1
                    }
                    className="border border-slate-400 bg-white px-4 py-3 text-center font-bold tracking-wide"
                  >
                    {formatTitleCase(section.sectionTitle)}
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
                    colSpan={currentMoires.reduce((count, moira) => count + moira.ales.length, 0) + 1}
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
                  {currentMoires.map((moira, index) => (
                    <th
                      key={`moira-${moira.id}`}
                      colSpan={moira.ales.length + (index === currentMoires.length - 1 ? 1 : 0)}
                      className="border border-slate-400 bg-slate-50 px-3 py-2 text-center font-bold uppercase"
                    >
                      {moira.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  {currentMoires.map((moira) => (
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
                  {currentMoires.flatMap((moira) =>
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

                    {currentMoires.flatMap((moira) =>
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
                              onChange={(event) =>
                                handleAmountChange(row.id, amountKey, event.target.value)
                              }
                              className="w-full appearance-none bg-transparent text-right text-[11px] outline-none focus:bg-cyan-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                          </td>
                        );
                      }),
                    )}

                    <td className="border border-slate-300 bg-orange-50 px-3 py-2 text-right font-bold text-slate-800">
                      {formatAmount(calculateRowTotal(row, currentMoires))}
                    </td>
                  </tr>
                ))}

                <tr className="bg-amber-100">
                  <td
                    colSpan={leftColumnCount}
                    className="border border-slate-400 px-3 py-3 text-right font-bold uppercase tracking-wide"
                  >
                    ΣΥΝ ΣΤΗΛ
                  </td>

                  {currentMoires.flatMap((moira) =>
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
                    {formatAmount(calculateGrandTotal(rows, currentMoires))}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : step === 'section-1b' ? (
            <Ypodeigma2Section1BStage
              rows={section1BRows}
              sectionId={section.section1B.sectionId}
              sectionTitle={section.section1B.sectionTitle}
              sharedConfig={{
                analysisLevels: section.analysisLevels,
                moires: section.moires,
              }}
              onBack={() => setStep('moira-entry')}
              onContinue={() => setStep('review')}
            />
          ) : (
            <Ypodeigma2ReviewTable
              rows={rows}
              section1BRows={section1BRows}
              section1BTitle={section.section1B.sectionTitle}
              section={section}
              onBack={() => setStep('section-1b')}
              onSave={() => {
                const payload = {
                  sectionId: section.sectionId,
                  section1AAmounts: rows.flatMap((row) =>
                    section.moires.flatMap((moira) =>
                      moira.ales.map((ale) => ({
                        rowId: row.id,
                        moiraId: moira.id,
                        aleId: ale.id,
                        amount: row.values[getAmountKey(moira.id, ale.id)] ?? null,
                      })),
                    ),
                  ),
                  section1BId: section.section1B.sectionId,
                  section1BAmounts: section1BRows.flatMap((row) =>
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

                saveYpodeigma2Submission({
                  id: crypto.randomUUID(),
                  createdAt: new Date().toISOString(),
                  sectionId: section.sectionId,
                  sectionTitle: section.sectionTitle,
                  totalAmount:
                    calculateGrandTotal(rows, section.moires) +
                    calculateGrandTotal(section1BRows, section.moires),
                  moiraCount: section.moires.length,
                  rowCount: rows.length + section1BRows.length,
                });

                // Προσωρινά κρατάμε και το payload διαθέσιμο για backend wiring.
                // eslint-disable-next-line no-console
                console.log('Save payload', payload);

                navigate('/dashboard/my-submissions');
              }}
            />
          )}
        </div>

        {step === 'moira-entry' && (
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentMoiraIndex((index) => Math.max(0, index - 1))}
              disabled={currentMoiraIndex === 0}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:border-slate-400 hover:bg-slate-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100"
            >
              Προηγούμενη Μοίρα
            </button>

            <div className="text-sm font-medium text-slate-700">
              Μοίρα {currentMoiraIndex + 1} από {section.moires.length}: {currentMoiraTitle}
            </div>

            {currentMoiraIndex < section.moires.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  setCurrentMoiraIndex((index) => Math.min(section.moires.length - 1, index + 1))
                }
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-sky-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-1"
              >
                Επόμενη Μοίρα
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep('section-1b')}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-amber-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1"
              >
                Συνέχεια στον πίνακα 1Β
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
