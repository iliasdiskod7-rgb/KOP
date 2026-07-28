import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { AppUserRole } from '../../../types/auth';
import { upsertYpodeigma2Submission } from '../ypodeigma2/submissionStorage';
import type { Ypodeigma2SubmissionStatus } from '../ypodeigma2/types';
import {
  calculateYpodeigma4Percentage,
  calculateYpodeigma4RowTotal,
  formatYpodeigma4Amount,
  getYpodeigma4AmountKey,
  parseYpodeigma4Amount,
} from './helpers';
import { fetchYpodeigma4Config } from './mockYpodeigma4Api';
import type {
  Ypodeigma4Config,
  Ypodeigma4FormActions,
  Ypodeigma4Row,
  Ypodeigma4SaveRequest,
} from './types';
import { saveYpodeigma4Submission } from './ypodeigma4Api';

type NumericChangeEvent = ChangeEvent<HTMLInputElement>;

type Ypodeigma4FormProps = {
  role: AppUserRole;
  selectedMonadaId: string | null;
  selectedMonadaLabel: string | null;
  selectedMoiraId: string | null;
  selectedMoiraLabel: string | null;
  selectedEtos: number | null;
  selectedEtosStatus: 'editable' | 'view' | null;
  selectedEtosSource: 'existing' | 'new' | null;
  onRegisterActions?: (actions: Ypodeigma4FormActions | null) => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

function sanitizeNumericInput(rawValue: string) {
  return rawValue.replace(/[^0-9.,-]/g, '');
}

function isPercentageRow(metricType: Ypodeigma4Row['metricType']) {
  return metricType === 'pososto-diathesis-p2';
}

function getInputStateKey(rowId: string, moiraId: string) {
  return `${rowId}::${moiraId}`;
}

function formatTotalDisplay(metricType: Ypodeigma4Row['metricType'], value: number | null) {
  const formattedValue = formatYpodeigma4Amount(value);

  if (!formattedValue) {
    return '';
  }

  return isPercentageRow(metricType) ? `${formattedValue}%` : formattedValue;
}

function applyCalculatedPercentages(
  rows: Ypodeigma4Row[],
  moires: Ypodeigma4Config['moires'],
) {
  const eoRow = rows.find((row) => row.metricType === 'diatetheises-eo');
  const percentageRow = rows.find((row) => row.metricType === 'pososto-diathesis-p2');

  if (!eoRow || !percentageRow) {
    return rows;
  }

  const totalEo = calculateYpodeigma4RowTotal(eoRow, moires);
  const percentageValues = Object.fromEntries(
    moires.map((moira) => {
      const valueKey = getYpodeigma4AmountKey(moira.id);
      const moiraEo = eoRow.values[valueKey] ?? null;

      return [valueKey, calculateYpodeigma4Percentage(moiraEo, totalEo)];
    }),
  );

  return rows.map((row) =>
    row.id === percentageRow.id
      ? {
          ...row,
          values: percentageValues,
        }
      : row,
  );
}

export default function Ypodeigma4Form({
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
}: Ypodeigma4FormProps) {
  const [config, setConfig] = useState<Ypodeigma4Config | null>(null);
  const [rows, setRows] = useState<Ypodeigma4Row[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputDrafts, setInputDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setConfig(null);
    setRows([]);
    setInputDrafts({});
    onDirtyChange?.(false);

    if (!selectedMonadaId || !selectedMonadaLabel || !selectedMoiraId || !selectedEtos) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    fetchYpodeigma4Config({
      monadaId: selectedMonadaId,
      monadaLabel: selectedMonadaLabel,
      etos: selectedEtos,
      etosStatus: selectedEtosStatus,
      etosSource: selectedEtosSource,
    }).then((nextConfig) => {
      if (!mounted) {
        return;
      }

      setConfig(nextConfig);
      setRows(applyCalculatedPercentages(nextConfig.rows, nextConfig.moires));
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [
    onDirtyChange,
    selectedEtos,
    selectedEtosSource,
    selectedEtosStatus,
    selectedMoiraId,
    selectedMonadaId,
    selectedMonadaLabel,
  ]);

  const sortedRows = useMemo(
    () => [...rows].sort((left, right) => left.displayOrder - right.displayOrder),
    [rows],
  );

  const sortedMoires = useMemo(
    () => [...(config?.moires ?? [])].sort((left, right) => left.displayOrder - right.displayOrder),
    [config?.moires],
  );

  const moiraColumnCount = sortedMoires.length;
  const isEditable = config?.status === 'editable' && role !== 'admin';

  const handleValueChange =
    (rowId: string, moiraId: string) => (event: NumericChangeEvent) => {
      const valueKey = getYpodeigma4AmountKey(moiraId);
      const currentRow = rows.find((row) => row.id === rowId);

      if (!currentRow || !isEditable) {
        return;
      }

      const rawValue = sanitizeNumericInput(event.target.value);
      const parsedValue = parseYpodeigma4Amount(rawValue);
      const inputStateKey = getInputStateKey(rowId, moiraId);

      setInputDrafts((currentDrafts) => ({
        ...currentDrafts,
        [inputStateKey]: rawValue,
      }));

      setRows((currentRows) => {
        const nextRows = currentRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                values: {
                  ...row.values,
                  [valueKey]: parsedValue,
                },
              }
            : row,
        );

        return applyCalculatedPercentages(nextRows, sortedMoires);
      });

      onDirtyChange?.(true);

    };

  const handleInputFocus =
    (rowId: string, moiraId: string, value: number | null) => () => {
      const inputStateKey = getInputStateKey(rowId, moiraId);
      const baseValue = value === null ? '' : String(value);

      setInputDrafts((currentDrafts) => ({
        ...currentDrafts,
        [inputStateKey]: baseValue,
      }));
    };

  const handleInputBlur = (rowId: string, moiraId: string) => () => {
    const inputStateKey = getInputStateKey(rowId, moiraId);

    setInputDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[inputStateKey];
      return nextDrafts;
    });
  };

  const getInputDisplayValue = (
    rowId: string,
    moiraId: string,
    metricType: Ypodeigma4Row['metricType'],
    value: number | null,
  ) => {
    const inputStateKey = getInputStateKey(rowId, moiraId);
    const draftValue = inputDrafts[inputStateKey];

    if (draftValue !== undefined) {
      return draftValue;
    }

    if (value === null) {
      return '';
    }

    return isPercentageRow(metricType) ? `${value}%` : String(value);
  };

  useEffect(() => {
    if (!onRegisterActions) {
      return;
    }

    if (!config || !selectedEtos || role === 'admin') {
      onRegisterActions(null);
      return;
    }

    const saveSubmission = async (status: Ypodeigma2SubmissionStatus) => {
      const payload: Ypodeigma4SaveRequest = {
        wingId: config.wing.id,
        etos: selectedEtos,
        rows: sortedRows.map((row) => ({
          rowId: row.id,
          metricType: row.metricType,
          values: row.values,
        })),
      };

      await saveYpodeigma4Submission(payload);

      const totalAmount = calculateYpodeigma4RowTotal(sortedRows[0], sortedMoires) ?? 0;

      upsertYpodeigma2Submission({
        id: `ypodeigma4-${selectedEtos}-${selectedMonadaId ?? 'unknown'}`,
        createdAt: new Date().toISOString(),
        ypodeigmaLabel: 'Υπόδειγμα 4',
        pterygaLabel: selectedMonadaLabel ?? selectedMonadaId,
        etos: selectedEtos,
        sectionId: 'Υπόδειγμα 4',
        sectionTitle: `Διάθεση ΕΩ - ${selectedMoiraLabel ?? selectedMoiraId ?? 'Μοίρες Α/Φ'}`,
        totalAmount,
        moiraCount: config.moires.length,
        rowCount: sortedRows.length,
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
    sortedMoires,
    sortedRows,
  ]);

  if (!selectedEtos || !selectedMonadaId || !selectedMoiraId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ 4</h1>
        <p className="mt-4 text-sm text-slate-600">
          Επιλέξτε έτος, μονάδα και μοίρα για να φορτωθεί το Υπόδειγμα 4.
        </p>
      </div>
    );
  }

  if (isLoading || !config) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-600">Φόρτωση Υποδείγματος 4...</p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg lg:p-5">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ 4</h1>
          <p className="mt-1 text-sm font-medium text-slate-600">Μονάδα: {config.wing.name}</p>
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

        <div className="overflow-x-auto rounded-xl border border-slate-300 bg-slate-50">
          <table className="w-full border-collapse text-[11px] text-slate-800">
            <colgroup>
              <col className="w-[34%]" />
              {sortedMoires.map((moira) => (
                <col key={`col-${moira.id}`} className="w-[14%]" />
              ))}
              <col className="w-[14%]" />
            </colgroup>

            <thead>
              <tr>
                <th
                  rowSpan={2}
                  className="border border-slate-400 bg-slate-100 px-2 py-2 text-left font-bold"
                >
                  {config.unit.name}
                </th>
                <th
                  colSpan={moiraColumnCount}
                  className="border border-slate-400 bg-slate-100 px-2 py-2 text-center font-bold"
                >
                  Μοίρα Α/Φ
                </th>
                <th
                  rowSpan={2}
                  className="border border-slate-400 bg-orange-100 px-2 py-2 text-center font-bold"
                >
                  Σύνολο
                </th>
              </tr>
              <tr>
                {sortedMoires.map((moira) => (
                  <th
                    key={`moira-${moira.id}`}
                    className="border border-slate-400 bg-slate-50 px-2 py-2 text-center font-semibold"
                  >
                    {moira.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sortedRows.map((row) => {
                const rowTotal = calculateYpodeigma4RowTotal(row, sortedMoires);

                return (
                  <tr key={row.id} className="bg-white">
                    <td className="border border-slate-300 px-2 py-2 font-medium">
                      {row.label}
                    </td>
                    {sortedMoires.map((moira) => {
                      const valueKey = getYpodeigma4AmountKey(moira.id);
                      const value = row.values[valueKey];

                      return (
                        <td
                          key={`${row.id}-${moira.id}`}
                          className="border border-slate-300 bg-white px-1.5 py-1.5"
                        >
                          {isEditable && !isPercentageRow(row.metricType) ? (
                            <input
                              type="text"
                              inputMode="decimal"
                              value={getInputDisplayValue(row.id, moira.id, row.metricType, value)}
                              onChange={handleValueChange(row.id, moira.id)}
                              onFocus={handleInputFocus(row.id, moira.id, value)}
                              onBlur={handleInputBlur(row.id, moira.id)}
                              className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-right text-[11px] outline-none transition focus:border-cyan-300 focus:ring-1 focus:ring-cyan-100"
                            />
                          ) : (
                            <div className="rounded bg-sky-50 px-2 py-1 text-right font-semibold text-sky-900">
                              {formatTotalDisplay(row.metricType, value ?? null)}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="border border-slate-300 bg-orange-50 px-2 py-2 text-right font-bold text-slate-700">
                      {formatTotalDisplay(row.metricType, rowTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
