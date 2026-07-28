import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { AppUserRole } from '../../../types/auth';
import { upsertYpodeigma2Submission } from '../ypodeigma2/submissionStorage';
import type { Ypodeigma2SubmissionStatus } from '../ypodeigma2/types';
import { fetchYpodeigma5Config } from './mockYpodeigma5Api';
import type {
  Ypodeigma5Config,
  Ypodeigma5FormActions,
  Ypodeigma5ResponsiblePerson,
  Ypodeigma5SaveRequest,
} from './types';
import { saveYpodeigma5Submission } from './ypodeigma5Api';

type Ypodeigma5FormProps = {
  role: AppUserRole;
  selectedMonadaId: string | null;
  selectedMonadaLabel: string | null;
  selectedEtos: number | null;
  selectedEtosStatus: 'editable' | 'view' | null;
  selectedEtosSource: 'existing' | 'new' | null;
  onRegisterActions?: (actions: Ypodeigma5FormActions | null) => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

type EditableTextField =
  | 'rank'
  | 'militaryRegistryNumber'
  | 'fullName'
  | 'department'
  | 'phone';

function createEmptyRow(displayOrder: number): Ypodeigma5ResponsiblePerson {
  return {
    id: `ypodeigma5-row-${crypto.randomUUID()}`,
    displayOrder,
    referenceTemplate: null,
    rank: '',
    militaryRegistryNumber: '',
    fullName: '',
    department: '',
    phone: '',
  };
}

export default function Ypodeigma5Form({
  role,
  selectedMonadaId,
  selectedMonadaLabel,
  selectedEtos,
  selectedEtosStatus,
  selectedEtosSource,
  onRegisterActions,
  onDirtyChange,
}: Ypodeigma5FormProps) {
  const [config, setConfig] = useState<Ypodeigma5Config | null>(null);
  const [rows, setRows] = useState<Ypodeigma5ResponsiblePerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setConfig(null);
    setRows([]);
    onDirtyChange?.(false);

    if (!selectedMonadaId || !selectedMonadaLabel || !selectedEtos) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    void fetchYpodeigma5Config({
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

  useEffect(() => {
    if (!onRegisterActions) {
      return;
    }

    if (!config || !selectedEtos || !isEditable) {
      onRegisterActions(null);
      return;
    }

    const saveSubmission = async (status: Ypodeigma2SubmissionStatus) => {
      const hasInvalidRows = sortedRows.some(
        (row) =>
          row.referenceTemplate === null ||
          !Number.isInteger(row.referenceTemplate) ||
          row.referenceTemplate < 2 ||
          row.referenceTemplate > 20 ||
          row.rank.trim() === '' ||
          row.militaryRegistryNumber.trim() === '' ||
          row.fullName.trim() === '' ||
          row.department.trim() === '' ||
          row.phone.trim() === '',
      );

      if (sortedRows.length === 0 || hasInvalidRows) {
        throw new Error(
          'Δεν ολοκληρώθηκε η ενέργεια. Συμπληρώστε όλα τα κόκκινα υποχρεωτικά πεδία και βεβαιωθείτε ότι το Υπόδειγμα Αναφοράς είναι ακέραιος αριθμός από 2 έως 20.',
        );
      }

      const payload: Ypodeigma5SaveRequest = {
        unitId: config.unit.id,
        etos: selectedEtos,
        rows: sortedRows.map((row) => ({
          rowId: row.id,
          displayOrder: row.displayOrder,
          referenceTemplate: row.referenceTemplate,
          rank: row.rank.trim(),
          militaryRegistryNumber: row.militaryRegistryNumber.trim(),
          fullName: row.fullName.trim(),
          department: row.department.trim(),
          phone: row.phone.trim(),
        })),
      };

      await saveYpodeigma5Submission(payload);

      upsertYpodeigma2Submission({
        id: `ypodeigma5-${selectedEtos}-${config.unit.id}`,
        createdAt: new Date().toISOString(),
        ypodeigmaLabel: 'Υπόδειγμα 5',
        pterygaLabel: config.unit.name,
        etos: selectedEtos,
        sectionId: 'Υπόδειγμα 5',
        sectionTitle: 'Υπεύθυνοι Στοιχείων ΚΩΠ',
        totalAmount: 0,
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

  const handleTextChange =
    (rowId: string, field: EditableTextField) => (event: ChangeEvent<HTMLInputElement>) => {
      if (!isEditable) {
        return;
      }

      const nextValue = event.target.value;
      setRows((currentRows) =>
        currentRows.map((row) => (row.id === rowId ? { ...row, [field]: nextValue } : row)),
      );
      onDirtyChange?.(true);
    };

  const handleReferenceTemplateChange =
    (rowId: string) => (event: ChangeEvent<HTMLInputElement>) => {
      if (!isEditable) {
        return;
      }

      const rawValue = event.target.value.replace(/\D/g, '').slice(0, 2);
      const parsedValue = rawValue === '' ? null : Number(rawValue);

      if (parsedValue !== null && parsedValue > 20) {
        return;
      }

      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === rowId ? { ...row, referenceTemplate: parsedValue } : row,
        ),
      );
      onDirtyChange?.(true);
    };

  const handleReferenceTemplateBlur = (rowId: string) => () => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId && row.referenceTemplate !== null && row.referenceTemplate < 2
          ? { ...row, referenceTemplate: null }
          : row,
      ),
    );
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

  const renderTextCell = (row: Ypodeigma5ResponsiblePerson, field: EditableTextField) => {
    if (!isEditable) {
      return row[field] || '-';
    }

    const isMissing = row[field].trim() === '';

    return (
      <input
        type="text"
        value={row[field]}
        onChange={handleTextChange(row.id, field)}
        required
        aria-invalid={isMissing}
        title={isMissing ? 'Το πεδίο είναι υποχρεωτικό.' : row[field]}
        className={`w-full min-w-0 rounded px-2 py-1.5 text-[11px] outline-none transition ${
          isMissing
            ? 'border-2 border-rose-500 bg-rose-50 text-rose-800 focus:border-rose-600 focus:ring-1 focus:ring-rose-200'
            : 'border border-slate-200 bg-white focus:border-cyan-400 focus:bg-cyan-50 focus:ring-1 focus:ring-cyan-200'
        }`}
      />
    );
  };

  if (!selectedEtos || !selectedMonadaId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ 5</h1>
        <p className="mt-4 text-sm text-slate-600">
          Επιλέξτε έτος και πατήστε Ανάκτηση για να φορτωθεί το Υπόδειγμα 5.
        </p>
      </div>
    );
  }

  if (isLoading || !config) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-600">Φόρτωση Υποδείγματος 5...</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg lg:p-5">
      <div className="mb-3">
        <h1 className="text-xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ 5</h1>
        <p className="mt-1 text-sm text-slate-600">Έτος αναφοράς: {config.etos}</p>
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

      <div className="overflow-x-auto rounded-xl border border-slate-300">
        <table className="w-full min-w-[920px] border-collapse text-[11px] text-slate-800">
          <colgroup>
            <col className="w-[6%]" />
            <col className="w-[13%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[21%]" />
            <col className="w-[24%]" />
            <col className="w-[14%]" />
            {isEditable ? <col className="w-[10%]" /> : null}
          </colgroup>

          <thead>
            <tr>
              <th
                colSpan={isEditable ? 8 : 7}
                className="border border-slate-400 bg-emerald-50 px-3 py-2 text-center text-sm font-bold"
              >
                Μονάδα: {config.unit.name}
              </th>
            </tr>
            <tr>
              <th rowSpan={2} className="border border-slate-400 bg-slate-100 px-2 py-2 text-center font-bold">
                α/α
              </th>
              <th rowSpan={2} className="border border-slate-400 bg-slate-100 px-2 py-2 text-center font-bold">
                Υπόδειγμα Αναφοράς (2,3,4)
              </th>
              <th colSpan={5} className="border border-slate-400 bg-sky-50 px-2 py-2 text-center text-sm font-bold">
                Υπεύθυνος Στοιχείων ΚΩΠ
              </th>
              {isEditable ? (
                <th
                  rowSpan={2}
                  className="w-[9%] border border-slate-400 bg-slate-100 px-2 py-2 text-center font-bold"
                >
                  Ενέργειες
                </th>
              ) : null}
            </tr>
            <tr>
              <th className="border border-slate-400 bg-slate-50 px-2 py-2 text-center font-bold">Βαθμός</th>
              <th className="border border-slate-400 bg-slate-50 px-2 py-2 text-center font-bold">ΑΜ</th>
              <th className="border border-slate-400 bg-slate-50 px-2 py-2 text-center font-bold">Ον/μο</th>
              <th className="border border-slate-400 bg-slate-50 px-2 py-2 text-center font-bold">
                Μοίρα-Γραφείο-Επιστασία
              </th>
              <th className="border border-slate-400 bg-slate-50 px-2 py-2 text-center font-bold">Τηλέφ</th>
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((row, index) => (
              <tr key={row.id} className="odd:bg-white even:bg-slate-50/70 hover:bg-cyan-50">
                <td className="border border-slate-300 px-2 py-2 text-center font-semibold">{index + 1}</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">
                  {isEditable ? (
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={row.referenceTemplate ?? ''}
                      onChange={handleReferenceTemplateChange(row.id)}
                      onBlur={handleReferenceTemplateBlur(row.id)}
                      placeholder="2-20"
                      required
                      aria-invalid={row.referenceTemplate === null}
                      title={
                        row.referenceTemplate === null
                          ? 'Το πεδίο είναι υποχρεωτικό. Επιτρέπονται ακέραιοι αριθμοί από 2 έως 20.'
                          : 'Επιτρέπονται μόνο ακέραιοι αριθμοί από 2 έως 20.'
                      }
                      className={`w-full rounded px-1.5 py-1.5 text-center text-[11px] outline-none transition ${
                        row.referenceTemplate === null
                          ? 'border-2 border-rose-500 bg-rose-50 text-rose-800 focus:border-rose-600 focus:ring-1 focus:ring-rose-200'
                          : 'border border-slate-200 bg-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-200'
                      }`}
                    />
                  ) : (
                    (row.referenceTemplate ?? '-')
                  )}
                </td>
                <td className="border border-slate-300 px-2 py-1.5 text-center">
                  {renderTextCell(row, 'rank')}
                </td>
                <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">
                  {renderTextCell(row, 'militaryRegistryNumber')}
                </td>
                <td className="border border-slate-300 px-2 py-1.5">
                  {renderTextCell(row, 'fullName')}
                </td>
                <td className="border border-slate-300 px-2 py-1.5">
                  {renderTextCell(row, 'department')}
                </td>
                <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">
                  {renderTextCell(row, 'phone')}
                </td>
                {isEditable ? (
                  <td className="border border-slate-300 bg-slate-50 px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id)}
                      title={`Διαγραφή γραμμής ${index + 1}`}
                      aria-label={`Διαγραφή γραμμής ${index + 1}`}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-[10px] font-semibold text-rose-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-rose-400 hover:bg-rose-100 hover:shadow"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" />
                      </svg>
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:from-sky-700 hover:to-blue-700 hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2.5">
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
            Προσθήκη γραμμής
          </button>
        </div>
      ) : null}
    </section>
  );
}
