import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { AppUserRole } from '../../../types/auth';
import { upsertYpodeigma2Submission } from '../ypodeigma2/submissionStorage';
import type { Ypodeigma2SubmissionStatus } from '../ypodeigma2/types';
import { buildYpodeigma3SavePayload } from './buildYpodeigma3Payload';
import { fetchYpodeigma3Config } from './mockYpodeigma3Api';
import {
  calculateP1,
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
import type {
  Ypodeigma3Config,
  Ypodeigma3EntryScope,
  Ypodeigma3FormActions,
  Ypodeigma3Row,
} from './types';
import { saveYpodeigma3Submission } from './ypodeigma3Api';

type Ypodeigma3FormProps = {
  role: AppUserRole;
  selectedMonadaId: string | null;
  selectedMonadaLabel: string | null;
  selectedMoiraId: string | null;
  selectedMoiraLabel: string | null;
  selectedEtos: number | null;
  selectedEtosStatus: 'editable' | 'view' | null;
  selectedEtosSource: 'existing' | 'new' | null;
  onRegisterActions?: (actions: Ypodeigma3FormActions | null) => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

type NumericChangeEvent = ChangeEvent<HTMLInputElement>;

const ANALYSIS_COLUMNS = [1, 2, 3, 4, 5, 6];

const OUTSIDE_COLUMN_LABELS: Record<(typeof OUTSIDE_COLUMN_TYPES)[number], string> = {
  sd: 'ΣΔ',
  sa: 'ΣΑ',
  p1: 'Π1',
};

const MOIRA_COLUMN_LABELS: Record<(typeof MOIRA_COLUMN_TYPES)[number], string> = {
  sd: 'ΣΔ',
  sa: 'ΣΑ',
  p1: 'Π1',
  op: 'ΩΕ',
  opfs: 'ΩΕ(f/s)',
};

function getCellClassName(isEditable: boolean, isParentRow: boolean, hasError = false) {
  if (hasError) {
    return 'border-2 border-rose-500 bg-rose-50 px-1 py-1 text-right';
  }

  if (isParentRow) {
    return 'border border-slate-300 bg-sky-100 px-1 py-1 text-right font-semibold text-sky-900';
  }

  if (!isEditable) {
    return 'border border-slate-300 bg-blue-400 px-1 py-1 text-right font-semibold text-blue-900';
  }

  return 'border border-slate-300 bg-white px-1 py-1';
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

function getSiblingValueKey(valueKey: string, columnType: 'sd' | 'sa' | 'p1') {
  const separatorIndex = valueKey.lastIndexOf('::');

  return `${valueKey.slice(0, separatorIndex)}::${columnType}`;
}

function applyCalculatedP1(values: Record<string, number | null>, p1Key: string) {
  const nextValues = { ...values };
  const sdKey = getSiblingValueKey(p1Key, 'sd');
  const saKey = getSiblingValueKey(p1Key, 'sa');

  nextValues[p1Key] = calculateP1(nextValues[sdKey] ?? null, nextValues[saKey] ?? null);

  return nextValues;
}

function applyCalculatedP1ToRows(config: Ypodeigma3Config) {
  return config.rows.map((row) => {
    let nextValues = { ...row.values };

    if (row.entryScope === 'moira-af-ep') {
      config.moires.forEach((moira) => {
        nextValues = applyCalculatedP1(nextValues, getMoiraAmountKey(moira.id, 'p1'));
      });
    } else {
      nextValues = applyCalculatedP1(nextValues, getOutsideAmountKey('p1'));
    }

    return {
      ...row,
      values: nextValues,
    };
  });
}

function getCalculatedP1DisplayValue(
  row: Ypodeigma3Row,
  p1Key: string,
  rows: Ypodeigma3Row[],
) {
  const sdValue = getDisplayValue(row, getSiblingValueKey(p1Key, 'sd'), rows);
  const saValue = getDisplayValue(row, getSiblingValueKey(p1Key, 'sa'), rows);

  return calculateP1(sdValue, saValue);
}

function getInputStateKey(rowId: string, valueKey: string) {
  return `${rowId}::${valueKey}`;
}

type TableSectionProps = {
  tableCode: '3Α' | '3Β';
  title: string;
  rows: Ypodeigma3Row[];
  entryScope: Ypodeigma3EntryScope;
  isFormEditable: boolean;
  validationErrors: Record<string, string>;
  selectedMoiraId: string | null;
  selectedMoiraLabel: string | null;
  onValueChange: (rowId: string, valueKey: string) => (event: NumericChangeEvent) => void;
  onInputFocus: (rowId: string, valueKey: string, displayValue: number | null) => () => void;
  onInputBlur: (rowId: string, valueKey: string) => () => void;
  getInputDisplayValue: (rowId: string, valueKey: string, displayValue: number | null) => string;
};

function TableSection({
  tableCode,
  title,
  rows,
  entryScope,
  isFormEditable,
  validationErrors,
  selectedMoiraId,
  selectedMoiraLabel,
  onValueChange,
  onInputFocus,
  onInputBlur,
  getInputDisplayValue,
}: TableSectionProps) {
  const valueColumnCount =
    entryScope === 'moira-af-ep' ? MOIRA_COLUMN_TYPES.length : OUTSIDE_COLUMN_TYPES.length;
  const totalColumns = 2 + ANALYSIS_COLUMNS.length + valueColumnCount;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
      <table className="w-full table-fixed border-collapse text-[10px] text-slate-800">
        <colgroup>
          <col className="w-[9%]" />
          {ANALYSIS_COLUMNS.map((column) => (
            <col key={`analysis-col-${tableCode}-${column}`} className="w-[3.5%]" />
          ))}
          <col className={entryScope === 'moira-af-ep' ? 'w-[34%]' : 'w-[40%]'} />
          {entryScope === 'moira-af-ep'
            ? MOIRA_COLUMN_TYPES.map((columnType) => (
                <col
                  key={`col-${tableCode}-${columnType}`}
                  className={columnType === 'op' || columnType === 'opfs' ? 'w-[8%]' : 'w-[6%]'}
                />
              ))
            : OUTSIDE_COLUMN_TYPES.map((columnType) => (
                <col key={`col-${tableCode}-${columnType}`} className="w-[10%]" />
              ))}
        </colgroup>

        <thead>
          <tr>
            <th
              colSpan={totalColumns}
              className="border border-slate-400 bg-slate-200 px-2 py-3 text-center text-xs font-bold tracking-wide"
            >
              {`ΥΠΟΔΕΙΓΜΑ 3-${tableCode}`}
            </th>
          </tr>
          <tr>
            <th
              colSpan={totalColumns}
              className="border border-slate-400 bg-white px-3 py-3 text-center font-bold tracking-wide"
            >
              {title}
            </th>
          </tr>
          <tr>
            <th
              rowSpan={entryScope === 'moira-af-ep' ? 3 : 2}
              className="border border-slate-400 bg-slate-100 px-2 py-2 text-center font-bold"
            >
              ΚΩΔΙΚΑΣ
            </th>
            <th
              colSpan={ANALYSIS_COLUMNS.length}
              className="border border-slate-400 bg-slate-100 px-2 py-2 text-center font-bold"
            >
              ΕΠΙΠΕΔΟ ΑΝΑΛΥΣΗΣ
            </th>
            <th
              rowSpan={entryScope === 'moira-af-ep' ? 3 : 2}
              className="border border-slate-400 bg-slate-100 px-2 py-2 text-center font-bold"
            >
              ΤΙΤΛΟΣ ΣΤΟΙΧΕΙΟΥ ΚΟΣΤΟΥΣ
            </th>

            {entryScope === 'moira-af-ep' ? (
              <th
                colSpan={MOIRA_COLUMN_TYPES.length}
                className="border border-slate-400 bg-slate-100 px-2 py-2 text-center font-bold"
              >
                Μοίρες Α/Φ-ΕΠ
              </th>
            ) : (
              <th
                colSpan={OUTSIDE_COLUMN_TYPES.length}
                className="border border-slate-400 bg-slate-100 px-2 py-2 text-center font-bold"
              >
                Στοιχεία
              </th>
            )}
          </tr>

          {entryScope === 'moira-af-ep' ? (
            <>
              <tr>
                {ANALYSIS_COLUMNS.map((column) => (
                  <th
                    key={`analysis-header-${tableCode}-${column}`}
                    rowSpan={2}
                    className="border border-slate-400 bg-white px-1 py-2 text-center font-bold"
                  >
                    {column}
                  </th>
                ))}
                <th
                  colSpan={MOIRA_COLUMN_TYPES.length}
                  className="border border-slate-400 bg-slate-50 px-2 py-2 text-center font-bold uppercase"
                >
                  {selectedMoiraLabel ?? 'ΜΟΙΡΑ'}
                </th>
              </tr>
              <tr>
                {MOIRA_COLUMN_TYPES.map((columnType) => (
                  <th
                    key={`moira-column-${tableCode}-${columnType}`}
                    className="border border-slate-400 bg-white px-2 py-2 text-center font-bold"
                  >
                    {MOIRA_COLUMN_LABELS[columnType]}
                  </th>
                ))}
              </tr>
            </>
          ) : (
            <tr>
              {ANALYSIS_COLUMNS.map((column) => (
                <th
                  key={`analysis-header-${tableCode}-${column}`}
                  className="border border-slate-400 bg-white px-1 py-2 text-center font-bold"
                >
                  {column}
                </th>
              ))}
              {OUTSIDE_COLUMN_TYPES.map((columnType) => (
                <th
                  key={`outside-header-${tableCode}-${columnType}`}
                  className="border border-slate-400 bg-slate-50 px-2 py-2 text-center font-bold"
                >
                  {OUTSIDE_COLUMN_LABELS[columnType]}
                </th>
              ))}
            </tr>
          )}
        </thead>

        <tbody>
          {rows.map((row) => {
            const isParentRow = hasChildRows(row, rows);
            const rowDepth = getRowDepth(row.code);

            return (
              <tr key={`${tableCode}-${row.id}`} className={isParentRow ? 'bg-sky-50' : 'bg-white'}>
                <td
                  className="border border-slate-300 px-1 py-1 text-center align-middle font-medium"
                  title={row.code}
                >
                  {row.code}
                </td>
                {ANALYSIS_COLUMNS.map((column) => (
                  <td
                    key={`${tableCode}-${row.id}-analysis-${column}`}
                    className="border border-slate-300 bg-white px-1 py-1 text-center align-middle font-semibold text-slate-700"
                  >
                    {row.analysisLevel === column ? 'x' : ''}
                  </td>
                ))}
                <td
                  className={`border border-slate-300 py-1 align-middle text-[10px] leading-tight ${
                    isParentRow ? 'bg-sky-100 font-semibold text-sky-900' : 'bg-white'
                  }`}
                  style={getIndentationStyle(rowDepth)}
                  title={row.costElementTitle}
                >
                  {row.costElementTitle}
                </td>

                {entryScope === 'moira-af-ep'
                  ? MOIRA_COLUMN_TYPES.map((columnType) => {
                      const valueKey = getMoiraAmountKey(selectedMoiraId ?? 'selected-moira', columnType);
                      const displayValue =
                        columnType === 'p1'
                          ? getCalculatedP1DisplayValue(row, valueKey, rows)
                          : getDisplayValue(row, valueKey, rows);
                      const isEditable = isFormEditable && !isParentRow && columnType !== 'p1';
                      const validationError = validationErrors[getInputStateKey(row.id, valueKey)];

                      return (
                        <td
                          key={`${tableCode}-${row.id}-${columnType}`}
                          className={getCellClassName(isEditable, isParentRow, Boolean(validationError))}
                          title={validationError ?? (displayValue === null ? '' : String(displayValue))}
                        >
                          {isEditable ? (
                            <input
                              type="text"
                              inputMode="decimal"
                              value={getInputDisplayValue(row.id, valueKey, displayValue)}
                              onChange={onValueChange(row.id, valueKey)}
                              onFocus={onInputFocus(row.id, valueKey, displayValue)}
                              onBlur={onInputBlur(row.id, valueKey)}
                              title={validationError ?? (displayValue === null ? '' : String(displayValue))}
                              className={`w-full min-w-0 rounded bg-white px-0.5 py-0.5 text-right font-mono text-[11px] font-semibold leading-tight outline-none transition ${
                                validationError
                                  ? 'border-2 border-rose-500 text-rose-800 focus:border-rose-600 focus:ring-1 focus:ring-rose-200'
                                  : 'border border-slate-200 focus:border-cyan-300 focus:ring-1 focus:ring-cyan-100'
                              }`}
                            />
                          ) : (
                            <span className="font-mono text-[11px] font-semibold">
                              {columnType === 'p1' && displayValue !== null
                                ? `${formatAmount(displayValue)}%`
                                : formatAmount(displayValue)}
                            </span>
                          )}
                        </td>
                      );
                    })
                  : OUTSIDE_COLUMN_TYPES.map((columnType) => {
                      const valueKey = getOutsideAmountKey(columnType);
                      const displayValue =
                        columnType === 'p1'
                          ? getCalculatedP1DisplayValue(row, valueKey, rows)
                          : getDisplayValue(row, valueKey, rows);
                      const isEditable = isFormEditable && !isParentRow && columnType !== 'p1';
                      const validationError = validationErrors[getInputStateKey(row.id, valueKey)];

                      return (
                        <td
                          key={`${tableCode}-${row.id}-${columnType}`}
                          className={getCellClassName(isEditable, isParentRow, Boolean(validationError))}
                          title={validationError ?? (displayValue === null ? '' : String(displayValue))}
                        >
                          {isEditable ? (
                            <input
                              type="text"
                              inputMode="decimal"
                              value={getInputDisplayValue(row.id, valueKey, displayValue)}
                              onChange={onValueChange(row.id, valueKey)}
                              onFocus={onInputFocus(row.id, valueKey, displayValue)}
                              onBlur={onInputBlur(row.id, valueKey)}
                              title={validationError ?? (displayValue === null ? '' : String(displayValue))}
                              className={`w-full min-w-0 rounded bg-white px-0.5 py-0.5 text-right font-mono text-[11px] font-semibold leading-tight outline-none transition ${
                                validationError
                                  ? 'border-2 border-rose-500 text-rose-800 focus:border-rose-600 focus:ring-1 focus:ring-rose-200'
                                  : 'border border-slate-200 focus:border-cyan-300 focus:ring-1 focus:ring-cyan-100'
                              }`}
                            />
                          ) : (
                            <span className="font-mono text-[11px] font-semibold">
                              {columnType === 'p1' && displayValue !== null
                                ? `${formatAmount(displayValue)}%`
                                : formatAmount(displayValue)}
                            </span>
                          )}
                        </td>
                      );
                    })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Ypodeigma3Form({
  role,
  selectedMonadaId,
  selectedMonadaLabel,
  selectedMoiraId,
  selectedMoiraLabel,
  selectedEtos,
  selectedEtosStatus,
  selectedEtosSource,
  onRegisterActions,
  onDirtyChange,
}: Ypodeigma3FormProps) {
  const [config, setConfig] = useState<Ypodeigma3Config | null>(null);
  const [rows, setRows] = useState<Ypodeigma3Row[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputDrafts, setInputDrafts] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setConfig(null);
    setRows([]);
    setInputDrafts({});
    setValidationErrors({});
    onDirtyChange?.(false);

    if (!selectedMonadaId || !selectedMonadaLabel || !selectedMoiraId || !selectedMoiraLabel || !selectedEtos) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    fetchYpodeigma3Config({
      monadaId: selectedMonadaId,
      monadaLabel: selectedMonadaLabel,
      moiraId: selectedMoiraId,
      moiraLabel: selectedMoiraLabel,
      etos: selectedEtos,
      etosStatus: selectedEtosStatus,
      etosSource: selectedEtosSource,
    }).then((nextConfig) => {
      if (!mounted) {
        return;
      }

      setConfig(nextConfig);
      setRows(applyCalculatedP1ToRows(nextConfig));
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [
    selectedEtos,
    selectedEtosSource,
    selectedEtosStatus,
    selectedMonadaId,
    selectedMonadaLabel,
    selectedMoiraId,
    selectedMoiraLabel,
    onDirtyChange,
  ]);

  const sortedRows = useMemo(
    () => [...rows].sort((left, right) => left.displayOrder - right.displayOrder),
    [rows],
  );

  const moiraRows = useMemo(
    () => sortedRows.filter((row) => row.entryScope === 'moira-af-ep'),
    [sortedRows],
  );

  const outsideRows = useMemo(
    () => sortedRows.filter((row) => row.entryScope === 'outside-moires'),
    [sortedRows],
  );
  const isEditable = selectedEtosStatus === 'editable' && role !== 'admin';

  useEffect(() => {
    if (!onRegisterActions) {
      return;
    }

    if (!config || role === 'admin') {
      onRegisterActions(null);
      return;
    }

    const saveSubmission = async (status: Ypodeigma2SubmissionStatus) => {
      if (Object.keys(validationErrors).length > 0) {
        throw new Error('Το Υπόδειγμα 3 περιέχει μη έγκυρες τιμές.');
      }

      const payload = buildYpodeigma3SavePayload(config, sortedRows, config.moires);
      await saveYpodeigma3Submission(payload);

      upsertYpodeigma2Submission({
        id: `ypodeigma3-${selectedEtos ?? 'unknown'}-${selectedMoiraId ?? 'unknown'}`,
        createdAt: new Date().toISOString(),
        ypodeigmaLabel: 'Υπόδειγμα 3',
        pterygaLabel: selectedMonadaLabel ?? selectedMonadaId,
        etos: selectedEtos,
        sectionId: 'Υπόδειγμα 3',
        sectionTitle: selectedMoiraLabel ?? selectedMoiraId ?? 'Χωρίς μοίρα',
        totalAmount: 0,
        moiraCount: config.moires.length,
        rowCount: payload.rows.length,
        status,
      });

      onDirtyChange?.(false);
    };

    onRegisterActions({
      saveDraft: () => saveSubmission('pending-submission'),
      submitFinal: () => saveSubmission('submitted'),
    });

    return () => {
      onRegisterActions(null);
    };
  }, [
    config,
    onDirtyChange,
    onRegisterActions,
    role,
    selectedEtos,
    selectedMoiraId,
    selectedMoiraLabel,
    selectedMonadaId,
    selectedMonadaLabel,
    sortedRows,
    validationErrors,
  ]);

  const handleValueChange =
    (rowId: string, valueKey: string) => (event: NumericChangeEvent) => {
      if (!isEditable) {
        return;
      }

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
            ? (() => {
                const nextValues = {
                  ...row.values,
                  [valueKey]: parsedValue,
                };
                const p1Key = getSiblingValueKey(valueKey, 'p1');

                return {
                  ...row,
                  values:
                    valueKey.endsWith('::sd') || valueKey.endsWith('::sa')
                      ? applyCalculatedP1(nextValues, p1Key)
                      : nextValues,
                };
              })()
            : row,
        ),
      );

      setValidationErrors((currentErrors) => {
        if (!currentErrors[inputStateKey]) {
          return currentErrors;
        }

        const nextErrors = { ...currentErrors };
        delete nextErrors[inputStateKey];
        return nextErrors;
      });
      onDirtyChange?.(true);
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

    if (!valueKey.endsWith('::sd') && !valueKey.endsWith('::sa')) {
      return;
    }

    const currentRow = rows.find((row) => row.id === rowId);

    if (!currentRow) {
      return;
    }

    const sd = currentRow.values[getSiblingValueKey(valueKey, 'sd')] ?? null;
    const sa = currentRow.values[getSiblingValueKey(valueKey, 'sa')] ?? null;
    const sdStateKey = getInputStateKey(rowId, getSiblingValueKey(valueKey, 'sd'));
    const saStateKey = getInputStateKey(rowId, getSiblingValueKey(valueKey, 'sa'));

    if (sa !== null && (sd === null || sa > sd)) {
      const invalidStateKey = valueKey.endsWith('::sd') ? sdStateKey : saStateKey;
      const validStateKey = valueKey.endsWith('::sd') ? saStateKey : sdStateKey;
      const message = valueKey.endsWith('::sd')
        ? 'Το ΣΔ δεν μπορεί να είναι μικρότερο από το ΣΑ.'
        : 'Το ΣΑ δεν μπορεί να είναι μεγαλύτερο από τη συνολική δύναμη ΣΔ.';

      setValidationErrors((currentErrors) => {
        const nextErrors = { ...currentErrors, [invalidStateKey]: message };
        delete nextErrors[validStateKey];
        return nextErrors;
      });
      return;
    }

    setValidationErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[sdStateKey];
      delete nextErrors[saStateKey];
      return nextErrors;
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

  if (!selectedEtos || !selectedMonadaId || !selectedMoiraId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ 3</h1>
        <p className="mt-4 text-sm text-slate-600">
          Επιλέξτε έτος, μονάδα και μοίρα για να φορτωθεί το Υπόδειγμα 3.
        </p>
      </div>
    );
  }

  if (isLoading || !config) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-600">
          Φόρτωση στοιχείων για {selectedMonadaLabel ?? selectedMonadaId} / {selectedMoiraLabel ?? selectedMoiraId}
          ...
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg lg:p-5">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ 3</h1>
          <p className="mt-1 text-sm text-slate-600">Μονάδα: {config.unit.name}</p>
          <p className="mt-1 text-sm text-slate-600">
            Επιλεγμένη μοίρα: {selectedMoiraLabel ?? selectedMoiraId}
            {selectedEtos ? ` - Έτος ${selectedEtos}` : ''}
          </p>
        </div>

        {role !== 'admin' ? (
          <div
            className={`mb-3 rounded-xl border px-4 py-2.5 text-sm ${
              isEditable
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {selectedEtosSource === 'new'
              ? `Το νέο έτος ${selectedEtos} είναι κενό και editable για νέα καταχώριση.`
              : isEditable
                ? `Το έτος ${selectedEtos} έχει mock δεδομένα από backend και είναι editable.`
                : `Το έτος ${selectedEtos} έχει mock δεδομένα από backend και είναι μόνο για προβολή.`}
          </div>
        ) : null}

        <div className="space-y-4">
          <TableSection
            tableCode="3Α"
            title="Μοίρες Α/Φ-ΕΠ"
            rows={moiraRows}
            entryScope="moira-af-ep"
            isFormEditable={isEditable}
            validationErrors={validationErrors}
            selectedMoiraId={selectedMoiraId}
            selectedMoiraLabel={selectedMoiraLabel}
            onValueChange={handleValueChange}
            onInputFocus={handleInputFocus}
            onInputBlur={handleInputBlur}
            getInputDisplayValue={getInputDisplayValue}
          />

          <TableSection
            tableCode="3Β"
            title="Μοίρες-Τμήματα-Επιστασίες Εκτός Μοιρών Α/Φ-Ε/Π"
            rows={outsideRows}
            entryScope="outside-moires"
            isFormEditable={isEditable}
            validationErrors={validationErrors}
            selectedMoiraId={selectedMoiraId}
            selectedMoiraLabel={selectedMoiraLabel}
            onValueChange={handleValueChange}
            onInputFocus={handleInputFocus}
            onInputBlur={handleInputBlur}
            getInputDisplayValue={getInputDisplayValue}
          />
        </div>

      </div>
    </section>
  );
}
