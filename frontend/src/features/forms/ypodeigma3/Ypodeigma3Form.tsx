import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { buildYpodeigma3SavePayload } from './buildYpodeigma3Payload';
import { fetchYpodeigma3Config } from './mockYpodeigma3Api';
import {
  formatAmount,
  getDisplayValue,
  getMoiraAmountKey,
  getOutsideAmountKey,
  getRowDepth,
  hasChildRows,
  MOIRA_COLUMN_TYPES,
  OUTSIDE_COLUMN_TYPES,
  parseAmount,
} from './helpers';
import type { Ypodeigma3Config, Ypodeigma3Row } from './types';
import { saveYpodeigma3Submission } from './ypodeigma3Api';

type NumericChangeEvent = ChangeEvent<HTMLInputElement>;

const OUTSIDE_COLUMN_LABELS: Record<(typeof OUTSIDE_COLUMN_TYPES)[number], string> = {
  sd: 'ΣΔ',
  sa: 'ΣΑ',
  p1: 'Π1',
};

const MOIRA_COLUMN_LABELS: Record<(typeof MOIRA_COLUMN_TYPES)[number], string> = {
  sd: 'ΣΔ',
  sa: 'ΣΑ',
  p1: 'Π1',
  op: 'ΩΡ',
  opfs: 'ΩΡ(f/s)',
};

function getCellClassName(isEditable: boolean, isParentRow: boolean) {
  if (isParentRow) {
    return 'border border-slate-300 bg-sky-100 px-0.5 py-1 text-right font-semibold text-sky-900';
  }

  if (!isEditable) {
    return 'border border-slate-300 bg-blue-400 px-0.5 py-1 text-right font-semibold text-blue-900';
  }

  return 'border border-slate-300 bg-white px-0.5 py-0.5';
}

function getIndentationStyle(depth: number) {
  return {
    paddingLeft: `${depth * 14 + 6}px`,
  };
}

function sanitizeNumericInput(rawValue: string) {
  return rawValue.replace(/[^0-9.,-]/g, '');
}

function sanitizePercentageInput(rawValue: string) {
  const sanitizedValue = rawValue.replace(/[^0-9.,%-]/g, '');
  const percentIndex = sanitizedValue.indexOf('%');

  if (percentIndex === -1) {
    return sanitizedValue;
  }

  return `${sanitizedValue.slice(0, percentIndex).replace(/%/g, '')}%`;
}

function isPercentageValueKey(valueKey: string) {
  return valueKey.endsWith('::p1');
}

function getInputStateKey(rowId: string, valueKey: string) {
  return `${rowId}::${valueKey}`;
}

export default function Ypodeigma3Form() {
  const [config, setConfig] = useState<Ypodeigma3Config | null>(null);
  const [rows, setRows] = useState<Ypodeigma3Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [inputDrafts, setInputDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;

    fetchYpodeigma3Config().then((nextConfig) => {
      if (!mounted) {
        return;
      }

      setConfig(nextConfig);
      setRows(nextConfig.rows);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const sortedRows = useMemo(
    () => [...rows].sort((left, right) => left.displayOrder - right.displayOrder),
    [rows],
  );

  const sortedMoires = useMemo(
    () => [...(config?.moires ?? [])].sort((left, right) => left.displayOrder - right.displayOrder),
    [config?.moires],
  );

  const totalColumns = 2 + OUTSIDE_COLUMN_TYPES.length + sortedMoires.length * MOIRA_COLUMN_TYPES.length;

  const handleValueChange =
    (rowId: string, valueKey: string) => (event: NumericChangeEvent) => {
      const rawValue = isPercentageValueKey(valueKey)
        ? sanitizePercentageInput(event.target.value)
        : sanitizeNumericInput(event.target.value);
      const parsedValue = parseAmount(rawValue.replace('%', ''));
      const inputStateKey = getInputStateKey(rowId, valueKey);

      setInputDrafts((currentDrafts) => ({
        ...currentDrafts,
        [inputStateKey]: rawValue,
      }));

      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                values: {
                  ...row.values,
                  [valueKey]: parsedValue,
                },
              }
            : row,
        ),
      );

      setSaveMessage(null);
      setSaveError(null);
    };

  const handleInputFocus = (rowId: string, valueKey: string, displayValue: number | null) => () => {
    const inputStateKey = getInputStateKey(rowId, valueKey);
    const baseValue = displayValue === null ? '' : String(displayValue);

    setInputDrafts((currentDrafts) => ({
      ...currentDrafts,
      [inputStateKey]: baseValue,
    }));
  };

  const handleInputBlur = (rowId: string, valueKey: string) => () => {
    const inputStateKey = getInputStateKey(rowId, valueKey);

    setInputDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[inputStateKey];
      return nextDrafts;
    });
  };

  const getInputDisplayValue = (rowId: string, valueKey: string, displayValue: number | null) => {
    const inputStateKey = getInputStateKey(rowId, valueKey);
    const draftValue = inputDrafts[inputStateKey];

    if (draftValue !== undefined) {
      return draftValue;
    }

    if (displayValue === null) {
      return '';
    }

    return isPercentageValueKey(valueKey) ? `${displayValue}%` : String(displayValue);
  };

  const handleSave = async () => {
    if (!config) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage(null);
      setSaveError(null);

      const payload = buildYpodeigma3SavePayload(config, sortedRows, sortedMoires);
      await saveYpodeigma3Submission(payload);

      setSaveMessage('Το Υπόδειγμα 3 αποθηκεύτηκε προσωρινά με επιτυχία.');
    } catch {
      setSaveError('Η αποθήκευση απέτυχε. Δοκιμάστε ξανά.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-600">Φόρτωση Υποδείγματος 3...</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg lg:p-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ 3</h1>
          <p className="mt-1 text-sm text-slate-600">Μονάδα: {config.unit.name}</p>
        </div>

        {saveMessage ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {saveMessage}
          </div>
        ) : null}

        {saveError ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {saveError}
          </div>
        ) : null}

        <div className="overflow-visible rounded-xl border border-slate-300 bg-slate-50 pb-16">
          <div className="w-[90.5%] origin-top-left scale-[1.105] transform">
            <table className="w-full table-fixed border-collapse text-[9px] text-slate-800 md:text-[10px]">
              <colgroup>
                <col className="w-[6.5%]" />
                <col className="w-[22%]" />
                <col className="w-[3.75%]" />
                <col className="w-[3.75%]" />
                <col className="w-[3.75%]" />
                {sortedMoires.flatMap((moira) =>
                  MOIRA_COLUMN_TYPES.map((columnType) => (
                    <col
                      key={`col-${moira.id}-${columnType}`}
                      className={columnType === 'op' || columnType === 'opfs' ? 'w-[4.5%]' : 'w-[3.75%]'}
                    />
                  )),
                )}
              </colgroup>

              <thead>
                <tr>
                  <th
                    colSpan={totalColumns}
                    className="border border-slate-400 bg-slate-200 px-1 py-2 text-center text-[10px] font-bold tracking-wide md:text-xs"
                  >
                    ΥΠΟΔΕΙΓΜΑ 3
                  </th>
                </tr>
                <tr>
                  <th
                    rowSpan={3}
                    className="border border-slate-400 bg-slate-100 px-1 py-1 text-center font-bold leading-tight whitespace-normal break-words"
                  >
                    ΚΩΔΙΚΑΣ
                  </th>
                  <th
                    rowSpan={3}
                    className="border border-slate-400 bg-slate-100 px-1 py-1 text-center font-bold leading-tight whitespace-normal break-words"
                  >
                    ΤΙΤΛΟΣ ΣΤΟΙΧΕΙΟΥ ΚΟΣΤΟΥΣ
                  </th>
                  <th
                    colSpan={OUTSIDE_COLUMN_TYPES.length}
                    className="border border-slate-400 bg-slate-100 px-1 py-1 text-center font-bold leading-tight whitespace-normal break-words"
                  >
                    Μοίρες-Τμήματα-Επιστασίες Εκτός Μοιρών Α/Φ-Ε/Π
                  </th>
                  <th
                    colSpan={sortedMoires.length * MOIRA_COLUMN_TYPES.length}
                    className="border border-slate-400 bg-slate-100 px-1 py-1 text-center font-bold leading-tight whitespace-normal break-words"
                  >
                    Μοίρες Α/Φ-ΕΠ
                  </th>
                </tr>
                <tr>
                  {OUTSIDE_COLUMN_TYPES.map((columnType) => (
                    <th
                      key={`outside-${columnType}`}
                      rowSpan={2}
                      className="border border-slate-400 bg-slate-50 px-0.5 py-1 text-center font-bold leading-tight whitespace-normal break-words"
                    >
                      {OUTSIDE_COLUMN_LABELS[columnType]}
                    </th>
                  ))}
                  {sortedMoires.map((moira) => (
                    <th
                      key={`moira-${moira.id}`}
                      colSpan={MOIRA_COLUMN_TYPES.length}
                      className="border border-slate-400 bg-slate-50 px-0.5 py-1 text-center font-bold leading-tight whitespace-normal break-words"
                    >
                      {moira.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  {sortedMoires.flatMap((moira) =>
                    MOIRA_COLUMN_TYPES.map((columnType) => (
                      <th
                        key={`moira-header-${moira.id}-${columnType}`}
                        className="border border-slate-400 bg-slate-50 px-0.5 py-1 text-center font-bold leading-tight whitespace-normal break-words"
                      >
                        {MOIRA_COLUMN_LABELS[columnType]}
                      </th>
                    )),
                  )}
                </tr>
              </thead>

              <tbody>
                {sortedRows.map((row) => {
                  const isParentRow = hasChildRows(row, sortedRows);
                  const rowDepth = getRowDepth(row.code);

                  return (
                    <tr key={row.id} className={isParentRow ? 'bg-sky-50' : 'bg-white'}>
                      <td
                        className="border border-slate-300 px-0.5 py-1 text-center align-middle font-medium"
                        title={row.code}
                      >
                        {row.code}
                      </td>
                      <td
                        className={`border border-slate-300 py-1 align-middle text-[9px] leading-tight md:text-[10px] ${
                          isParentRow ? 'bg-sky-100 font-semibold text-sky-900' : 'bg-white'
                        }`}
                        style={getIndentationStyle(rowDepth)}
                        title={row.costElementTitle}
                      >
                        {row.costElementTitle}
                      </td>

                      {OUTSIDE_COLUMN_TYPES.map((columnType) => {
                        const valueKey = getOutsideAmountKey(columnType);
                        const isEditable = !isParentRow && row.entryScope === 'outside-moires';
                        const displayValue = getDisplayValue(row, valueKey, sortedRows);

                        return (
                          <td
                            key={`${row.id}-${valueKey}`}
                            className={getCellClassName(isEditable, isParentRow)}
                            title={displayValue === null ? '' : String(displayValue)}
                          >
                            {isEditable ? (
                            <input
                              type="text"
                              inputMode="decimal"
                              value={getInputDisplayValue(row.id, valueKey, displayValue)}
                              onChange={handleValueChange(row.id, valueKey)}
                              onFocus={handleInputFocus(row.id, valueKey, displayValue)}
                              onBlur={handleInputBlur(row.id, valueKey)}
                              title={displayValue === null ? '' : String(displayValue)}
                              className="w-full min-w-0 rounded border border-slate-200 bg-white px-0.5 py-0.5 text-right font-mono text-[9px] leading-tight outline-none transition focus:border-cyan-300 focus:ring-1 focus:ring-cyan-100"
                            />
                            ) : (
                              <span>{formatAmount(displayValue)}</span>
                            )}
                          </td>
                        );
                      })}

                      {sortedMoires.flatMap((moira) =>
                        MOIRA_COLUMN_TYPES.map((columnType) => {
                          const valueKey = getMoiraAmountKey(moira.id, columnType);
                          const isEditable = !isParentRow && row.entryScope === 'moira-af-ep';
                          const displayValue = getDisplayValue(row, valueKey, sortedRows);

                          return (
                            <td
                              key={`${row.id}-${valueKey}`}
                              className={getCellClassName(isEditable, isParentRow)}
                              title={displayValue === null ? '' : String(displayValue)}
                            >
                              {isEditable ? (
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={getInputDisplayValue(row.id, valueKey, displayValue)}
                                  onChange={handleValueChange(row.id, valueKey)}
                                  onFocus={handleInputFocus(row.id, valueKey, displayValue)}
                                  onBlur={handleInputBlur(row.id, valueKey)}
                                  title={displayValue === null ? '' : String(displayValue)}
                                  className="w-full min-w-0 rounded border border-slate-200 bg-white px-0.5 py-0.5 text-right font-mono text-[9px] leading-tight outline-none transition focus:border-cyan-300 focus:ring-1 focus:ring-cyan-100"
                                />
                              ) : (
                                <span>{formatAmount(displayValue)}</span>
                              )}
                            </td>
                          );
                        }),
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-emerald-300 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-sm"
          >
            {isSaving ? 'Αποθήκευση...' : 'Αποθήκευση'}
          </button>
        </div>
      </div>
    </section>
  );
}
