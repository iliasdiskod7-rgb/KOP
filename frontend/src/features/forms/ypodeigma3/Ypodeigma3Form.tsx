import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { fetchYpodeigma3Config } from './mockYpodeigma3Api';
import {
  formatAmount,
  getDisplayValue,
  getEditableKeysForScope,
  getMoiraAmountKey,
  getOutsideAmountKey,
  getRowDepth,
  hasChildRows,
  isLeafRow,
  MOIRA_COLUMN_TYPES,
  OUTSIDE_COLUMN_TYPES,
  parseAmount,
} from './helpers';
import type { Ypodeigma3Config, Ypodeigma3Moira, Ypodeigma3Row } from './types';

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

function getEditableValueKeys(row: Ypodeigma3Row, moires: Ypodeigma3Moira[], rows: Ypodeigma3Row[]) {
  if (!isLeafRow(row, rows)) {
    return [];
  }

  return getEditableKeysForScope(row.entryScope, moires);
}

export default function Ypodeigma3Form() {
  const [config, setConfig] = useState<Ypodeigma3Config | null>(null);
  const [rows, setRows] = useState<Ypodeigma3Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const rawValue = sanitizeNumericInput(event.target.value);

      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                values: {
                  ...row.values,
                  [valueKey]: parseAmount(rawValue),
                },
              }
            : row,
        ),
      );
    };

  const handleSave = () => {
    if (!config) {
      return;
    }

    const payload = {
      unitId: config.unit.id,
      rows: sortedRows
        .filter((row) => isLeafRow(row, sortedRows))
        .map((row) => {
          const editableValueKeys = getEditableValueKeys(row, sortedMoires, sortedRows);
          const values = Object.fromEntries(
            editableValueKeys.map((valueKey) => [valueKey, row.values[valueKey] ?? null]),
          );

          return {
            rowId: row.id,
            code: row.code,
            entryScope: row.entryScope,
            values,
          };
        }),
    };

    // Εδώ αργότερα θα αντικατασταθεί από POST προς backend.
    // eslint-disable-next-line no-console
    console.log('Ypodeigma3 save payload', payload);
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
                              value={displayValue === null ? '' : String(displayValue)}
                              onChange={handleValueChange(row.id, valueKey)}
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
                                value={displayValue === null ? '' : String(displayValue)}
                                onChange={handleValueChange(row.id, valueKey)}
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
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1"
          >
            Αποθήκευση
          </button>
        </div>
      </div>
    </section>
  );
}
