import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { AppUserRole } from '../../../types/auth';
import { upsertYpodeigma2Submission } from '../ypodeigma2/submissionStorage';
import type { Ypodeigma2SubmissionStatus } from '../ypodeigma2/types';
import {
  calculateYpodeigma6Total,
  formatYpodeigma6Number,
  parseYpodeigma6Number,
  sanitizeYpodeigma6Number,
} from './helpers';
import { fetchYpodeigma6Config } from './mockYpodeigma6Api';
import type {
  Ypodeigma6Config,
  Ypodeigma6FormActions,
  Ypodeigma6Row,
  Ypodeigma6SaveRequest,
} from './types';
import { saveYpodeigma6Submission } from './ypodeigma6Api';

type Ypodeigma6FormProps = {
  role: AppUserRole;
  selectedMonadaId: string | null;
  selectedMonadaLabel: string | null;
  selectedEtos: number | null;
  selectedEtosStatus: 'editable' | 'view' | null;
  selectedEtosSource: 'existing' | 'new' | null;
  onRegisterActions?: (actions: Ypodeigma6FormActions | null) => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

type TextField =
  | 'description'
  | 'measurementUnit'
  | 'aircraftSquadron'
  | 'aircraftType'
  | 'notes';

type NumericField = 'sntTotalFlightHours' | 'quantity' | 'costPerUnit';

function createEmptyRow(displayOrder: number): Ypodeigma6Row {
  return {
    id: `ypodeigma6-row-${crypto.randomUUID()}`,
    displayOrder,
    description: '',
    sntTotalFlightHours: null,
    measurementUnit: '',
    quantity: null,
    aircraftSquadron: '',
    aircraftType: '',
    costPerUnit: null,
    notes: '',
  };
}

function isRowInvalid(row: Ypodeigma6Row) {
  return (
    row.description.trim() === '' ||
    row.sntTotalFlightHours === null ||
    row.measurementUnit.trim() === '' ||
    row.quantity === null ||
    row.aircraftSquadron.trim() === '' ||
    row.aircraftType.trim() === '' ||
    row.costPerUnit === null ||
    row.notes.trim() === ''
  );
}

function getInputClassName(isMissing: boolean, extraClasses = '') {
  return `w-full min-w-0 rounded px-2 py-1.5 text-[11px] leading-snug outline-none transition ${extraClasses} ${
    isMissing
      ? 'border-2 border-rose-500 bg-rose-50 text-rose-800 focus:border-rose-600 focus:ring-1 focus:ring-rose-200'
      : 'border border-slate-200 bg-white focus:border-cyan-400 focus:bg-cyan-50 focus:ring-1 focus:ring-cyan-200'
  }`;
}

function getNumericDraftKey(rowId: string, field: NumericField) {
  return `${rowId}::${field}`;
}

export default function Ypodeigma6Form({
  role,
  selectedMonadaId,
  selectedMonadaLabel,
  selectedEtos,
  selectedEtosStatus,
  selectedEtosSource,
  onRegisterActions,
  onDirtyChange,
}: Ypodeigma6FormProps) {
  const [config, setConfig] = useState<Ypodeigma6Config | null>(null);
  const [rows, setRows] = useState<Ypodeigma6Row[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [numericDrafts, setNumericDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setConfig(null);
    setRows([]);
    setNumericDrafts({});
    onDirtyChange?.(false);

    if (!selectedMonadaId || !selectedMonadaLabel || !selectedEtos) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    void fetchYpodeigma6Config({
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
      setRows(nextConfig.rows);
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
    selectedMonadaId,
    selectedMonadaLabel,
  ]);

  const sortedRows = useMemo(
    () => [...rows].sort((left, right) => left.displayOrder - right.displayOrder),
    [rows],
  );
  const isEditable = config?.status === 'editable' && role !== 'admin';

  const handleTextChange =
    (rowId: string, field: TextField) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!isEditable) {
        return;
      }

      const nextValue = event.target.value;
      setRows((currentRows) =>
        currentRows.map((row) => (row.id === rowId ? { ...row, [field]: nextValue } : row)),
      );
      onDirtyChange?.(true);
    };

  const handleNumericChange =
    (rowId: string, field: NumericField) => (event: ChangeEvent<HTMLInputElement>) => {
      if (!isEditable) {
        return;
      }

      const sanitizedValue = sanitizeYpodeigma6Number(event.target.value);
      const nextValue = parseYpodeigma6Number(sanitizedValue);
      const draftKey = getNumericDraftKey(rowId, field);

      setNumericDrafts((currentDrafts) => ({
        ...currentDrafts,
        [draftKey]: sanitizedValue,
      }));
      setRows((currentRows) =>
        currentRows.map((row) => (row.id === rowId ? { ...row, [field]: nextValue } : row)),
      );
      onDirtyChange?.(true);
    };

  const handleNumericFocus = (rowId: string, field: NumericField, value: number | null) => () => {
    const draftKey = getNumericDraftKey(rowId, field);
    setNumericDrafts((currentDrafts) => ({
      ...currentDrafts,
      [draftKey]: value === null ? '' : String(value),
    }));
  };

  const handleNumericBlur = (rowId: string, field: NumericField) => () => {
    const draftKey = getNumericDraftKey(rowId, field);
    setNumericDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[draftKey];
      return nextDrafts;
    });
  };

  const handleAddRow = () => {
    if (!isEditable) {
      return;
    }

    setRows((currentRows) => [
      ...currentRows,
      createEmptyRow(
        currentRows.reduce((highestOrder, row) => Math.max(highestOrder, row.displayOrder), 0) + 1,
      ),
    ]);
    onDirtyChange?.(true);
  };

  const handleDeleteRow = (rowId: string) => {
    if (!isEditable) {
      return;
    }

    setRows((currentRows) =>
      currentRows
        .filter((row) => row.id !== rowId)
        .sort((left, right) => left.displayOrder - right.displayOrder)
        .map((row, index) => ({ ...row, displayOrder: index + 1 })),
    );
    onDirtyChange?.(true);
  };

  useEffect(() => {
    if (!onRegisterActions) {
      return;
    }

    if (!config || !selectedEtos || !isEditable) {
      onRegisterActions(null);
      return;
    }

    const saveSubmission = async (status: Ypodeigma2SubmissionStatus) => {
      if (sortedRows.length === 0 || sortedRows.some(isRowInvalid)) {
        throw new Error(
          'Δεν ολοκληρώθηκε η ενέργεια. Συμπληρώστε όλα τα κόκκινα υποχρεωτικά πεδία του Υποδείγματος 6.',
        );
      }

      const payload: Ypodeigma6SaveRequest = {
        unitId: config.unit.id,
        etos: selectedEtos,
        rows: sortedRows.map((row) => ({
          ...row,
          totalCost: calculateYpodeigma6Total(row),
        })),
      };

      await saveYpodeigma6Submission(payload);

      upsertYpodeigma2Submission({
        id: `ypodeigma6-${selectedEtos}-${config.unit.id}`,
        createdAt: new Date().toISOString(),
        ypodeigmaLabel: 'Υπόδειγμα 6',
        pterygaLabel: config.unit.name,
        etos: selectedEtos,
        sectionId: 'Υπόδειγμα 6',
        sectionTitle: 'Κόστος ανά Μονάδα Μέτρησης',
        totalAmount: payload.rows.reduce((sum, row) => sum + row.totalCost, 0),
        moiraCount: 0,
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
  }, [config, isEditable, onDirtyChange, onRegisterActions, selectedEtos, sortedRows]);

  const renderTextInput = (row: Ypodeigma6Row, field: TextField, multiline = false) => {
    const value = row[field];

    if (!isEditable) {
      return (
        <span title={value || '-'} className="block whitespace-normal break-words leading-snug">
          {value || '-'}
        </span>
      );
    }

    const isMissing = value.trim() === '';

    if (multiline) {
      return (
        <textarea
          rows={2}
          value={value}
          onChange={handleTextChange(row.id, field)}
          required
          aria-invalid={isMissing}
          title={isMissing ? 'Το πεδίο είναι υποχρεωτικό.' : value}
          className={getInputClassName(isMissing, 'resize-none')}
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={handleTextChange(row.id, field)}
        required
        aria-invalid={isMissing}
        title={isMissing ? 'Το πεδίο είναι υποχρεωτικό.' : value}
        className={getInputClassName(isMissing)}
      />
    );
  };

  const renderNumericInput = (row: Ypodeigma6Row, field: NumericField) => {
    const value = row[field];
    const draftKey = getNumericDraftKey(row.id, field);
    const draftValue = numericDrafts[draftKey];

    if (!isEditable) {
      return formatYpodeigma6Number(value);
    }

    return (
      <input
        type="text"
        inputMode="decimal"
        value={draftValue ?? value ?? ''}
        onChange={handleNumericChange(row.id, field)}
        onFocus={handleNumericFocus(row.id, field, value)}
        onBlur={handleNumericBlur(row.id, field)}
        required
        aria-invalid={value === null}
        title={value === null ? 'Το πεδίο είναι υποχρεωτικό.' : String(value)}
        className={getInputClassName(value === null, 'text-right font-mono')}
      />
    );
  };

  if (!selectedEtos || !selectedMonadaId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ 6</h1>
        <p className="mt-4 text-sm text-slate-600">
          Επιλέξτε έτος και πατήστε Ανάκτηση για να φορτωθεί το Υπόδειγμα 6.
        </p>
      </div>
    );
  }

  if (isLoading || !config) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-600">Φόρτωση Υποδείγματος 6...</p>
      </div>
    );
  }

  return (
    <section className="relative left-1/2 w-[calc(100vw-1rem)] max-w-[1700px] -translate-x-1/2 space-y-4 sm:w-[calc(100vw-2rem)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg lg:p-5">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ 6</h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Μονάδα: {config.unit.name} - Έτος {selectedEtos}
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
              ? `Το νέο έτος ${selectedEtos} ξεκινά με μία κενή εγγραφή και είναι editable.`
              : isEditable
                ? `Το έτος ${selectedEtos} έχει mock δεδομένα από backend και είναι editable.`
                : `Το έτος ${selectedEtos} έχει mock δεδομένα από backend και είναι μόνο για προβολή.`}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-slate-300 xl:overflow-x-visible">
          <table className="w-full min-w-[1300px] table-fixed border-collapse text-[11px] text-slate-800 xl:min-w-0">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[18%]" />
              <col className="w-[9%]" />
              <col className="w-[6%]" />
              <col className="w-[8%]" />
              <col className="w-[9%]" />
              <col className="w-[8%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[17%]" />
              {isEditable ? <col className="w-[9%]" /> : null}
            </colgroup>

            <thead>
              <tr>
                <th
                  colSpan={isEditable ? 11 : 10}
                  className="border border-slate-400 bg-slate-200 px-3 py-2.5 text-center text-sm font-bold"
                >
                  ΥΠΟΔΕΙΓΜΑ 6
                </th>
              </tr>
              <tr className="bg-slate-100">
                {[
                  'Α/Α',
                  'ΠΕΡΙΓΡΑΦΗ',
                  'SNt total Flight hours',
                  'ΜΜ',
                  'ΠΟΣΟΤΗΤΑ',
                  'ΜΟΙΡΑ Α/Φ',
                  'ΤΥΠΟΣ Α/Φ',
                  'ΚΟΣΤΟΣ ΑΝΑ ΜΜ',
                  'ΣΥΝΟΛΙΚΟ ΚΟΣΤΟΣ',
                  'ΠΑΡΑΤΗΡΗΣΕΙΣ',
                ].map((label) => (
                  <th
                    key={label}
                    className="border border-slate-400 px-1.5 py-2 text-center font-bold leading-tight whitespace-normal break-words"
                  >
                    {label}
                  </th>
                ))}
                {isEditable ? (
                  <th className="border border-slate-400 px-1.5 py-2 text-center font-bold">
                    ΕΝΕΡΓΕΙΕΣ
                  </th>
                ) : null}
              </tr>
            </thead>

            <tbody>
              {sortedRows.map((row, index) => (
                <tr key={row.id} className="bg-white hover:bg-cyan-50/40">
                  <td className="border border-slate-300 px-1 py-2 text-center font-semibold">
                    {index + 1}
                  </td>
                  <td className="border border-slate-300 px-1.5 py-1.5">
                    {renderTextInput(row, 'description', true)}
                  </td>
                  <td className="border border-slate-300 px-1 py-1.5">
                    {renderNumericInput(row, 'sntTotalFlightHours')}
                  </td>
                  <td className="border border-slate-300 px-1 py-1.5 text-center">
                    {renderTextInput(row, 'measurementUnit')}
                  </td>
                  <td className="border border-slate-300 px-1 py-1.5">
                    {renderNumericInput(row, 'quantity')}
                  </td>
                  <td className="border border-slate-300 px-1 py-1.5">
                    {renderTextInput(row, 'aircraftSquadron')}
                  </td>
                  <td className="border border-slate-300 px-1 py-1.5">
                    {renderTextInput(row, 'aircraftType')}
                  </td>
                  <td className="border border-slate-300 px-1 py-1.5">
                    {renderNumericInput(row, 'costPerUnit')}
                  </td>
                  <td className="border border-slate-300 bg-orange-50 px-2 py-2 text-right font-bold text-orange-900">
                    {formatYpodeigma6Number(calculateYpodeigma6Total(row))}
                  </td>
                  <td className="border border-slate-300 px-1.5 py-1.5">
                    {renderTextInput(row, 'notes', true)}
                  </td>
                  {isEditable ? (
                    <td className="border border-slate-300 bg-slate-50 px-1.5 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        title={`Διαγραφή γραμμής ${index + 1}`}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-[10px] font-semibold text-rose-700 transition hover:scale-105 hover:border-rose-400 hover:bg-rose-100"
                      >
                        Διαγραφή
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isEditable ? (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleAddRow}
              className="rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:from-sky-700 hover:to-blue-700 hover:shadow-md"
            >
              + Προσθήκη γραμμής
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
