import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  calculateYpodeigma4RowTotal,
  formatYpodeigma4Amount,
  getYpodeigma4AmountKey,
  parseYpodeigma4Amount,
} from './helpers';
import { fetchYpodeigma4Config } from './mockYpodeigma4Api';
import type { Ypodeigma4Config, Ypodeigma4Row } from './types';

type NumericChangeEvent = ChangeEvent<HTMLInputElement>;

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

export default function Ypodeigma4Form() {
  const [config, setConfig] = useState<Ypodeigma4Config | null>(null);
  const [rows, setRows] = useState<Ypodeigma4Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputDrafts, setInputDrafts] = useState<Record<string, string>>({});
  const [validationMessage, setValidationMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchYpodeigma4Config().then((nextConfig) => {
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

  const moiraColumnCount = sortedMoires.length;

  const handleValueChange =
    (rowId: string, moiraId: string) => (event: NumericChangeEvent) => {
      const valueKey = getYpodeigma4AmountKey(moiraId);
      const currentRow = rows.find((row) => row.id === rowId);

      if (!currentRow) {
        return;
      }

      const rawValue = isPercentageRow(currentRow.metricType)
        ? sanitizePercentageInput(event.target.value)
        : sanitizeNumericInput(event.target.value);
      const parsedValue = parseYpodeigma4Amount(rawValue.replace('%', ''));
      const inputStateKey = getInputStateKey(rowId, moiraId);

      if (isPercentageRow(currentRow.metricType)) {
        const nextRowTotal = sortedMoires.reduce((sum, moira) => {
          const currentValueKey = getYpodeigma4AmountKey(moira.id);
          const nextValue =
            moira.id === moiraId ? parsedValue : (currentRow.values[currentValueKey] ?? null);

          return sum + (nextValue ?? 0);
        }, 0);

        if (nextRowTotal > 100) {
          setValidationMessage('Το συνολικό άθροισμα της γραμμής Ποσοστό διάθεσης Π2 δεν μπορεί να ξεπερνά το 100%.');
          return;
        }
      }

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

      setValidationMessage('');
      setSaveMessage(null);
      setSaveError(null);
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

  const handleSave = async () => {
    if (!config) {
      return;
    }

    const payload = {
      unitId: config.unit.id,
      rows: sortedRows.map((row) => ({
        rowId: row.id,
        metricType: row.metricType,
        values: row.values,
      })),
    };

    try {
      setIsSaving(true);
      setSaveMessage(null);
      setSaveError(null);

      await new Promise((resolve) => window.setTimeout(resolve, 600));

      // Εδώ αργότερα θα γίνει POST προς backend.
      // eslint-disable-next-line no-console
      console.log('Ypodeigma4 save payload', payload);

      setSaveMessage('Το Υπόδειγμα 4 αποθηκεύτηκε με επιτυχία.');
    } catch {
      setSaveError('Η αποθήκευση απέτυχε. Δοκιμάστε ξανά.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-600">Φόρτωση Υποδείγματος 4...</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg lg:p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ 4</h1>
          <p className="mt-1 text-sm font-medium text-slate-600">Μονάδα: {config.wing.name}</p>
        </div>

        {validationMessage ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {validationMessage}
          </div>
        ) : null}

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
                          <input
                            type="text"
                            inputMode="decimal"
                            value={getInputDisplayValue(row.id, moira.id, row.metricType, value)}
                            onChange={handleValueChange(row.id, moira.id)}
                            onFocus={handleInputFocus(row.id, moira.id, value)}
                            onBlur={handleInputBlur(row.id, moira.id)}
                            className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-right text-[11px] outline-none transition focus:border-cyan-300 focus:ring-1 focus:ring-cyan-100"
                          />
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

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-emerald-300 disabled:hover:translate-y-0 disabled:hover:scale-100"
          >
            {isSaving ? 'Αποθήκευση...' : 'Αποθήκευση'}
          </button>
        </div>
      </div>
    </section>
  );
}
