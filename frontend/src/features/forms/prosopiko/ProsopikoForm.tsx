import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { AppUserRole } from '../../../types/auth';
import { upsertYpodeigma2Submission } from '../ypodeigma2/submissionStorage';
import type { Ypodeigma2SubmissionStatus } from '../ypodeigma2/types';
import {
  fetchProsopikoClassificationOptions,
  fetchProsopikoConfig,
} from './mockProsopikoApi';
import { saveProsopikoSubmission } from './prosopikoApi';
import type {
  ProsopikoClassificationOption,
  ProsopikoConfig,
  ProsopikoFormActions,
  ProsopikoMovementType,
  ProsopikoRow,
  ProsopikoSaveRequest,
} from './types';

type ProsopikoFormProps = {
  role: AppUserRole;
  selectedMonadaId: string | null;
  selectedMonadaLabel: string | null;
  selectedEtos: number | null;
  selectedEtosStatus: 'editable' | 'view' | null;
  selectedEtosSource: 'existing' | 'new' | null;
  onRegisterActions?: (actions: ProsopikoFormActions | null) => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

type EditableTextField = Exclude<
  keyof ProsopikoRow,
  'id' | 'displayOrder' | 'movementType' | 'imeres'
>;

function formatDate(value: string) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('el-GR').format(new Date(value));
}

function keepOnlyCodeCharacters(value: string) {
  const sanitizedValue = value.replace(/[^0-9.]/g, '');
  let previousCharacter = '';

  return sanitizedValue
    .split('')
    .filter((character, index) => {
      if (character !== '.') {
        previousCharacter = character;
        return true;
      }

      if (index === 0 || previousCharacter === '.') {
        return false;
      }

      previousCharacter = character;
      return true;
    })
    .join('');
}

function isValidClassificationCode(value: string) {
  return /^\d+(\.\d+)*$/.test(value);
}

function hasMatchingClassificationOption(
  value: string,
  options: ProsopikoClassificationOption[],
) {
  const trimmedValue = value.trim();

  return options.some((option) => option.code === trimmedValue);
}

function buildSuggestions(
  value: string,
  options: ProsopikoClassificationOption[],
): ProsopikoClassificationOption[] {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return [];
  }

  return options
    .filter((option) => option.code.startsWith(trimmedValue))
    .sort((left, right) => left.code.localeCompare(right.code, 'el-GR', { numeric: true }))
    .slice(0, 8);
}

function calculateNetDays(row: ProsopikoRow, rows: ProsopikoRow[]) {
  if (row.movementType !== 'Τοποθέτηση') {
    return null;
  }

  const detachmentDays = rows
    .filter(
      (candidateRow) =>
        candidateRow.ama === row.ama && candidateRow.movementType === 'Απόσπαση',
    )
    .reduce((sum, candidateRow) => sum + (candidateRow.imeres ?? 0), 0);

  return row.imeres === null ? null : row.imeres - detachmentDays;
}

function createEmptyRow(displayOrder: number): ProsopikoRow {
  return {
    id: `prosopiko-row-${crypto.randomUUID()}`,
    displayOrder,
    vathmos: '',
    eid: '',
    eponymo: '',
    onoma: '',
    ama: '',
    epiteleioMonadaYpiresia: '',
    kladosMoiraAllo: '',
    dieythynsiEpistasiaAllo: '',
    tmimaGrafeioAllo: '',
    apo: '',
    eos: '',
    taxinomisiKodikaPinaka1Kai62: '',
    movementType: null,
    imeres: null,
  };
}

function isRequiredValueMissing(row: ProsopikoRow) {
  return (
    row.vathmos.trim() === '' ||
    row.eid.trim() === '' ||
    row.eponymo.trim() === '' ||
    row.onoma.trim() === '' ||
    row.ama.trim() === '' ||
    row.epiteleioMonadaYpiresia.trim() === '' ||
    row.kladosMoiraAllo.trim() === '' ||
    row.dieythynsiEpistasiaAllo.trim() === '' ||
    row.tmimaGrafeioAllo.trim() === '' ||
    row.apo.trim() === '' ||
    row.eos.trim() === '' ||
    row.taxinomisiKodikaPinaka1Kai62.trim() === '' ||
    row.movementType === null ||
    row.imeres === null
  );
}

function hasInvalidDateRange(row: ProsopikoRow) {
  return row.apo.trim() !== '' && row.eos.trim() !== '' && row.eos < row.apo;
}

function getRequiredInputClassName(isMissing: boolean, extraClasses = '') {
  return `w-full min-w-0 rounded px-1.5 py-1.5 text-[11px] leading-snug outline-none transition xl:text-[11px] ${extraClasses} ${
    isMissing
      ? 'border-2 border-rose-500 bg-rose-50 text-rose-800 focus:border-rose-600 focus:ring-1 focus:ring-rose-200'
      : 'border border-slate-200 bg-white focus:border-cyan-400 focus:bg-cyan-50 focus:ring-1 focus:ring-cyan-200'
  }`;
}

export default function ProsopikoForm({
  role,
  selectedMonadaId,
  selectedMonadaLabel,
  selectedEtos,
  selectedEtosStatus,
  selectedEtosSource,
  onRegisterActions,
  onDirtyChange,
}: ProsopikoFormProps) {
  const [config, setConfig] = useState<ProsopikoConfig | null>(null);
  const [rows, setRows] = useState<ProsopikoRow[]>([]);
  const [classificationOptions, setClassificationOptions] = useState<ProsopikoClassificationOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [invalidRowIds, setInvalidRowIds] = useState<string[]>([]);

  useEffect(() => {
    setConfig(null);
    setRows([]);
    setInvalidRowIds([]);
    setValidationMessage('');
    onDirtyChange?.(false);

    if (!selectedMonadaId || !selectedMonadaLabel || !selectedEtos) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    Promise.all([
      fetchProsopikoConfig({
        monadaId: selectedMonadaId,
        monadaLabel: selectedMonadaLabel,
        etos: selectedEtos,
        etosStatus: selectedEtosStatus,
        etosSource: selectedEtosSource,
      }),
      fetchProsopikoClassificationOptions(),
    ]).then(
      ([nextConfig, nextOptions]) => {
        if (!mounted) {
          return;
        }

        setConfig(nextConfig);
        setRows(nextConfig.rows);
        setClassificationOptions(nextOptions);
        setIsLoading(false);
      },
    );

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

  const activeRow = useMemo(
    () => rows.find((row) => row.id === activeRowId) ?? null,
    [activeRowId, rows],
  );

  const activeSuggestions = useMemo(
    () =>
      activeRow
        ? buildSuggestions(activeRow.taxinomisiKodikaPinaka1Kai62, classificationOptions)
        : [],
    [activeRow, classificationOptions],
  );

  const handleClassificationChange =
    (rowId: string) => (event: ChangeEvent<HTMLInputElement>) => {
      if (!isEditable) {
        return;
      }

      const nextValue = keepOnlyCodeCharacters(event.target.value);

      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                taxinomisiKodikaPinaka1Kai62: nextValue,
              }
            : row,
        ),
      );

      setActiveRowId(rowId);
      setValidationMessage('');
      onDirtyChange?.(true);
    };

  const handleSuggestionSelect = (rowId: string, code: string) => {
    if (!isEditable) {
      return;
    }

    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              taxinomisiKodikaPinaka1Kai62: code,
            }
          : row,
      ),
    );

    setActiveRowId(null);
    setInvalidRowIds((currentRowIds) => currentRowIds.filter((currentRowId) => currentRowId !== rowId));
    setValidationMessage('');
    onDirtyChange?.(true);
  };

  const handleClassificationFocus = (rowId: string) => {
    setActiveRowId(rowId);
    setInvalidRowIds((currentRowIds) =>
      currentRowIds.filter((currentRowId) => currentRowId !== rowId),
    );
    setValidationMessage('');
  };

  const handleClassificationBlur = (rowId: string) => {
    window.setTimeout(() => {
      const currentRow = rows.find((row) => row.id === rowId);

      if (currentRow) {
        const trimmedValue = currentRow.taxinomisiKodikaPinaka1Kai62.trim();
        const isInvalidValue =
          trimmedValue.length > 0 &&
          (!isValidClassificationCode(trimmedValue) ||
            !hasMatchingClassificationOption(trimmedValue, classificationOptions));

        setInvalidRowIds((currentRowIds) => {
          if (isInvalidValue) {
            return currentRowIds.includes(rowId) ? currentRowIds : [...currentRowIds, rowId];
          }

          return currentRowIds.filter((currentRowId) => currentRowId !== rowId);
        });
      }

      setActiveRowId((currentRowId) => (currentRowId === rowId ? null : currentRowId));
    }, 120);
  };

  const handleTextChange =
    (rowId: string, field: EditableTextField) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!isEditable || field === 'taxinomisiKodikaPinaka1Kai62') {
        return;
      }

      const nextValue = event.target.value;
      setRows((currentRows) =>
        currentRows.map((row) => (row.id === rowId ? { ...row, [field]: nextValue } : row)),
      );
      onDirtyChange?.(true);
    };

  const handleMovementTypeChange =
    (rowId: string) => (event: ChangeEvent<HTMLSelectElement>) => {
      if (!isEditable) {
        return;
      }

      const nextValue = event.target.value as ProsopikoMovementType | '';
      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === rowId ? { ...row, movementType: nextValue || null } : row,
        ),
      );
      onDirtyChange?.(true);
    };

  const handleDaysChange = (rowId: string) => (event: ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) {
      return;
    }

    const rawValue = event.target.value.replace(/\D/g, '');
    const nextValue = rawValue === '' ? null : Number(rawValue);
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === rowId ? { ...row, imeres: nextValue } : row)),
    );
    onDirtyChange?.(true);
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
    setInvalidRowIds((currentIds) => currentIds.filter((id) => id !== rowId));
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
      const nextInvalidRowIds = sortedRows
        .filter((row) => {
          const classificationCode = row.taxinomisiKodikaPinaka1Kai62.trim();

          return (
            isRequiredValueMissing(row) ||
            hasInvalidDateRange(row) ||
            !isValidClassificationCode(classificationCode) ||
            !hasMatchingClassificationOption(classificationCode, classificationOptions)
          );
        })
        .map((row) => row.id);

      setInvalidRowIds(nextInvalidRowIds);

      if (sortedRows.length === 0 || nextInvalidRowIds.length > 0) {
        setValidationMessage(
          'Δεν ολοκληρώθηκε η ενέργεια. Συμπληρώστε όλα τα κόκκινα υποχρεωτικά πεδία, επιλέξτε έγκυρο κωδικό ταξινόμησης και ελέγξτε ότι η ημερομηνία ΕΩΣ δεν προηγείται της ημερομηνίας ΑΠΟ.',
        );
        throw new Error(
          'Συμπληρώστε σωστά όλα τα πεδία του Προσωπικού. Η ημερομηνία ΕΩΣ δεν μπορεί να είναι μικρότερη από την ημερομηνία ΑΠΟ.',
        );
      }

      const payload: ProsopikoSaveRequest = {
        unitId: config.unit.id,
        etos: selectedEtos,
        rows: sortedRows.map((row) => ({ ...row })),
      };

      await saveProsopikoSubmission(payload);

      upsertYpodeigma2Submission({
        id: `prosopiko-${selectedEtos}-${config.unit.id}`,
        createdAt: new Date().toISOString(),
        ypodeigmaLabel: 'Προσωπικό',
        pterygaLabel: config.unit.name,
        etos: selectedEtos,
        sectionId: 'Προσωπικό',
        sectionTitle: 'Στοιχεία Προσωπικού',
        totalAmount: 0,
        moiraCount: 0,
        rowCount: payload.rows.length,
        status,
      });

      setValidationMessage('');
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
    classificationOptions,
    config,
    isEditable,
    onDirtyChange,
    onRegisterActions,
    selectedEtos,
    sortedRows,
  ]);

  const renderTextValue = (
    row: ProsopikoRow,
    field: Exclude<EditableTextField, 'taxinomisiKodikaPinaka1Kai62'>,
    inputType: 'text' | 'date' = 'text',
  ) => {
    if (!isEditable) {
      const value = row[field];
      const displayValue = inputType === 'date' ? formatDate(value) : value || '-';

      return (
        <span
          title={displayValue}
          className="block whitespace-normal break-words leading-snug"
        >
          {displayValue}
        </span>
      );
    }

    const value = row[field];
    const isMissing = value.trim() === '';
    const hasDateError = field === 'eos' && hasInvalidDateRange(row);
    const isMultiline =
      inputType === 'text' &&
      [
        'epiteleioMonadaYpiresia',
        'kladosMoiraAllo',
        'dieythynsiEpistasiaAllo',
        'tmimaGrafeioAllo',
      ].includes(field);

    if (isMultiline) {
      return (
        <textarea
          rows={2}
          value={value}
          onChange={handleTextChange(row.id, field)}
          required
          aria-invalid={isMissing}
          title={isMissing ? 'Το πεδίο είναι υποχρεωτικό.' : value}
          className={getRequiredInputClassName(
            isMissing,
            'resize-none whitespace-normal break-words leading-tight',
          )}
        />
      );
    }

    return (
      <input
        type={inputType}
        value={value}
        onChange={handleTextChange(row.id, field)}
        min={field === 'eos' && row.apo ? row.apo : undefined}
        required
        aria-invalid={isMissing || hasDateError}
        title={
          hasDateError
            ? 'Η ημερομηνία ΕΩΣ δεν μπορεί να είναι μικρότερη από την ημερομηνία ΑΠΟ.'
            : isMissing
              ? 'Το πεδίο είναι υποχρεωτικό.'
              : value
        }
        className={getRequiredInputClassName(
          isMissing || hasDateError,
          inputType === 'date' ? 'px-0.5 xl:!text-[10px]' : '',
        )}
      />
    );
  };

  if (!selectedEtos || !selectedMonadaId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">ΠΡΟΣΩΠΙΚΟ</h1>
        <p className="mt-4 text-sm text-slate-600">
          Επιλέξτε έτος και πατήστε Ανάκτηση για να φορτωθούν τα στοιχεία προσωπικού.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-600">Φόρτωση στοιχείων προσωπικού...</p>
      </div>
    );
  }

  return (
    <section className="relative left-1/2 w-[calc(100vw-1rem)] max-w-[1800px] -translate-x-1/2 space-y-5 sm:w-[calc(100vw-2rem)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg lg:p-6">
        <div className="mb-4 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">ΠΡΟΣΩΠΙΚΟ</h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Μονάδα: {config?.unit.name} - Έτος {selectedEtos}
            </p>
            <p className="text-sm text-slate-600">
              Το ΣΥΝ ΜΕΡΕΣ υπολογίζεται μόνο για την Τοποθέτηση αφαιρώντας τυχόν
              ημέρες Απόσπασης του ίδιου στελέχους.
            </p>
          </div>
        </div>

        {role !== 'admin' ? (
          <div
            className={`mb-4 rounded-xl border px-4 py-2.5 text-sm ${
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

        {validationMessage ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {validationMessage}
          </div>
        ) : null}

        <div className="overflow-visible rounded-xl border border-slate-300 bg-slate-50">
          <div
            className={`overflow-x-auto overflow-y-visible xl:overflow-x-visible ${
              activeSuggestions.length > 0 ? 'pb-44' : ''
            }`}
          >
            <table className="w-full min-w-[1500px] border-collapse text-[11px] leading-snug text-slate-800 xl:min-w-0 xl:table-fixed xl:text-[11px]">
              <colgroup>
                <col className="w-[6%]" />
                <col className="w-[4.5%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[6%]" />
                <col className="w-[10.5%]" />
                <col className="w-[9.5%]" />
                <col className="w-[10.5%]" />
                <col className="w-[9.5%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[11%]" />
                <col className="w-[15%]" />
                <col className="w-[5.5%]" />
                <col className="w-[6.5%]" />
                {isEditable ? <col className="w-[8%]" /> : null}
              </colgroup>

              <thead>
                <tr>
                  <th
                    colSpan={isEditable ? 16 : 15}
                    className="border border-slate-400 bg-slate-200 px-3 py-3 text-center text-sm font-bold tracking-wide"
                  >
                    ΠΡΟΣΩΠΙΚΟ
                  </th>
                </tr>
                <tr className="bg-slate-100">
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">ΒΑΘΜΟΣ</th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">ΕΙΔ</th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">ΕΠΩΝΥΜΟ</th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">ΟΝΟΜΑ</th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">ΑΜΑ</th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΕΠΙΤΕΛΕΙΟ/ΜΟΝΑΔΑ/ΥΠΗΡΕΣΙΑ
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΚΛΑΔΟΣ/ΜΟΙΡΑ ή άλλο
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΔΙΕΥΘΥΝΣΗ/ΕΠΙΣΤΑΣΙΑ ή άλλο
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΤΜΗΜΑ/ΓΡΑΦΕΙΟ ή άλλο
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">ΑΠΟ</th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">ΕΩΣ</th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">ΕΙΔΟΣ</th>
                  <th className="border border-slate-400 bg-amber-50 px-2 py-2.5 text-center font-bold leading-tight">
                    Ταξινόμηση κατά Κώδικα Πίνακα 1 και του Πίνακα 6.2
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">ΗΜΕΡΕΣ</th>
                  <th className="border border-slate-400 bg-sky-100 px-2 py-2.5 text-center font-bold leading-tight">
                    ΣΥΝ ΜΕΡΕΣ
                  </th>
                  {isEditable ? (
                    <th className="border border-slate-400 bg-slate-100 px-2 py-2.5 text-center font-bold leading-tight">
                      ΕΝΕΡΓΕΙΕΣ
                    </th>
                  ) : null}
                </tr>
              </thead>

              <tbody>
                {sortedRows.map((row, index) => {
                  const hasError = invalidRowIds.includes(row.id);
                  const isActiveRow = activeRowId === row.id;
                  const showSuggestions = isActiveRow && activeSuggestions.length > 0;
                  const netDays = calculateNetDays(row, rows);

                  return (
                    <tr key={row.id} className="bg-white">
                      <td className="border border-slate-300 px-1 py-1.5 text-center align-middle">
                        {renderTextValue(row, 'vathmos')}
                      </td>
                      <td className="border border-slate-300 px-1 py-1.5 text-center align-middle">
                        {renderTextValue(row, 'eid')}
                      </td>
                      <td className="border border-slate-300 px-1 py-1.5 align-middle">
                        {renderTextValue(row, 'eponymo')}
                      </td>
                      <td className="border border-slate-300 px-1 py-1.5 align-middle">
                        {renderTextValue(row, 'onoma')}
                      </td>
                      <td className="border border-slate-300 px-1 py-1.5 text-center align-middle">
                        {renderTextValue(row, 'ama')}
                      </td>
                      <td className="border border-slate-300 bg-slate-50 px-2 py-2 align-middle">
                        {renderTextValue(row, 'epiteleioMonadaYpiresia')}
                      </td>
                      <td className="border border-slate-300 bg-slate-50 px-2 py-2 align-middle">
                        {renderTextValue(row, 'kladosMoiraAllo')}
                      </td>
                      <td className="border border-slate-300 bg-slate-50 px-2 py-2 align-middle">
                        {renderTextValue(row, 'dieythynsiEpistasiaAllo')}
                      </td>
                      <td className="border border-slate-300 bg-slate-50 px-2 py-2 align-middle">
                        {renderTextValue(row, 'tmimaGrafeioAllo')}
                      </td>
                      <td className="border border-slate-300 px-1 py-1.5 text-center align-middle">
                        {renderTextValue(row, 'apo', 'date')}
                      </td>
                      <td className="border border-slate-300 px-1 py-1.5 text-center align-middle">
                        {renderTextValue(row, 'eos', 'date')}
                      </td>
                      <td className="border border-slate-300 bg-cyan-50 px-2 py-2 text-center font-semibold align-middle">
                        {isEditable ? (
                          <div className="relative">
                            <select
                              value={row.movementType ?? ''}
                              onChange={handleMovementTypeChange(row.id)}
                              required
                              aria-invalid={row.movementType === null}
                              className={getRequiredInputClassName(
                                row.movementType === null,
                                'appearance-none pr-6 text-center',
                              )}
                            >
                              <option value="">-</option>
                              <option value="Τοποθέτηση">Τοποθέτηση</option>
                              <option value="Απόσπαση">Απόσπαση</option>
                            </select>
                            <svg
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                              className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 fill-slate-500"
                            >
                              <path d="m5.5 7.5 4.5 4.5 4.5-4.5 1.2 1.2-5.7 5.7-5.7-5.7 1.2-1.2Z" />
                            </svg>
                          </div>
                        ) : (
                          <span title={row.movementType ?? '-'}>{row.movementType ?? '-'}</span>
                        )}
                      </td>
                      <td
                        className={`relative border px-2 py-1.5 align-top ${
                          hasError ? 'border-rose-300 bg-rose-50' : 'border-slate-300 bg-amber-50'
                        }`}
                      >
                        <div>
                          {isEditable ? (
                          <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9.]*"
                            value={row.taxinomisiKodikaPinaka1Kai62}
                            onChange={handleClassificationChange(row.id)}
                            onFocus={() => handleClassificationFocus(row.id)}
                            onBlur={() => handleClassificationBlur(row.id)}
                            placeholder="π.χ. 1.2.3"
                            required
                            aria-invalid={hasError || row.taxinomisiKodikaPinaka1Kai62.trim() === ''}
                            className={getRequiredInputClassName(
                              hasError || row.taxinomisiKodikaPinaka1Kai62.trim() === '',
                            )}
                          />
                          ) : (
                            <span
                              title={row.taxinomisiKodikaPinaka1Kai62 || '-'}
                              className="block whitespace-normal break-words font-semibold text-sky-800"
                            >
                              {row.taxinomisiKodikaPinaka1Kai62 || '-'}
                            </span>
                          )}

                          {isEditable && showSuggestions ? (
                            <div className="absolute left-2 top-full z-20 mt-1 w-[300px] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-lg">
                              <div className="border-b border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                Διαθέσιμες επιλογές
                              </div>
                              <div className="max-h-[180px] overflow-y-auto">
                                {activeSuggestions.map((option) => (
                                  <button
                                    key={option.code}
                                    type="button"
                                    onMouseDown={() => handleSuggestionSelect(row.id, option.code)}
                                    className="w-full border-b border-slate-100 px-2 py-1.5 text-left transition-colors duration-150 last:border-b-0 hover:bg-cyan-50"
                                  >
                                    <div className="text-[11px] font-bold text-sky-700">{option.code}</div>
                                    <div className="mt-0.5 whitespace-normal break-words text-[10px] leading-snug text-slate-600">
                                      {option.description}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="border border-slate-300 bg-sky-50 px-2 py-2 text-center font-semibold align-middle">
                        {isEditable ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            value={row.imeres ?? ''}
                            onChange={handleDaysChange(row.id)}
                            required
                            aria-invalid={row.imeres === null}
                            className={getRequiredInputClassName(row.imeres === null, 'text-center')}
                          />
                        ) : (
                          <span title={row.imeres === null ? '-' : String(row.imeres)}>
                            {row.imeres ?? '-'}
                          </span>
                        )}
                      </td>
                      <td className="border border-slate-300 bg-sky-100 px-2 py-2 text-center font-bold align-middle">
                        {netDays ?? '-'}
                      </td>
                      {isEditable ? (
                        <td className="border border-slate-300 bg-slate-50 px-2 py-1.5 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(row.id)}
                            title={`Διαγραφή γραμμής ${index + 1}`}
                            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-[10px] font-semibold text-rose-700 transition duration-200 hover:scale-105 hover:border-rose-400 hover:bg-rose-100"
                          >
                            Διαγραφή
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {isEditable ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleAddRow}
            className="rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:from-sky-700 hover:to-blue-700 hover:shadow-md"
          >
            + Προσθήκη γραμμής
          </button>
        </div>
        ) : null}
      </div>
    </section>
  );
}
