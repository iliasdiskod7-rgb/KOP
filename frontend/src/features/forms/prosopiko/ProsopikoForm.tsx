import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchProsopikoClassificationOptions,
  fetchProsopikoRows,
} from './mockProsopikoApi';
import type { ProsopikoClassificationOption, ProsopikoRow } from './types';

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
    .reduce((sum, candidateRow) => sum + candidateRow.imeres, 0);

  return row.imeres - detachmentDays;
}

export default function ProsopikoForm() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ProsopikoRow[]>([]);
  const [classificationOptions, setClassificationOptions] = useState<ProsopikoClassificationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [invalidRowIds, setInvalidRowIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    Promise.all([fetchProsopikoRows(), fetchProsopikoClassificationOptions()]).then(
      ([nextRows, nextOptions]) => {
        if (!mounted) {
          return;
        }

        setRows(nextRows);
        setClassificationOptions(nextOptions);
        setIsLoading(false);
      },
    );

    return () => {
      mounted = false;
    };
  }, []);

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
    };

  const handleSuggestionSelect = (rowId: string, code: string) => {
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

  const handleSave = () => {
    const nextInvalidRowIds = rows
      .filter((row) => {
        const trimmedValue = row.taxinomisiKodikaPinaka1Kai62.trim();

        return (
          trimmedValue.length > 0 &&
          (!isValidClassificationCode(trimmedValue) ||
            !hasMatchingClassificationOption(trimmedValue, classificationOptions))
        );
      })
      .map((row) => row.id);

    setInvalidRowIds(nextInvalidRowIds);

    if (nextInvalidRowIds.length > 0) {
      setValidationMessage(
        'Πρέπει να έχει έγκυρο διαθέσιμο κωδικό από τις επιλογές. Αν δεν θέλετε να δηλώσετε τον κωδικό, άφησέ το κενό.',
      );
      return;
    }

    const payload = {
      rows: rows.map((row) => ({
        id: row.id,
        taxinomisiKodikaPinaka1Kai62: row.taxinomisiKodikaPinaka1Kai62,
      })),
    };

    // Εδώ αργότερα θα γίνει POST/PUT προς το backend ώστε να ενημερωθεί η βάση δεδομένων.
    // eslint-disable-next-line no-console
    console.log('Prosopiko save payload', payload);

    navigate('/dashboard/ypologismos', {
      state: {
        successMessage: 'Τα στοιχεία αποθηκεύτηκαν με επιτυχία.',
      },
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-600">Φόρτωση στοιχείων προσωπικού...</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg lg:p-6">
        <div className="mb-4 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">ΠΡΟΣΩΠΙΚΟ</h1>
            <p className="text-sm text-slate-600">
              Το ΣΥΝ ΜΕΡΕΣ υπολογίζεται μόνο για την Τοποθέτηση αφαιρώντας τυχόν
              ημέρες Απόσπασης του ίδιου στελέχους.
            </p>
          </div>
        </div>

        {validationMessage ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {validationMessage}
          </div>
        ) : null}

        <div className="overflow-visible rounded-xl border border-slate-300 bg-slate-50">
          <div
            className={`overflow-x-auto overflow-y-visible ${
              activeSuggestions.length > 0 ? 'pb-44' : ''
            }`}
          >
            <table className="w-full min-w-[1460px] border-collapse text-[10px] text-slate-800 md:text-[11px] xl:min-w-0">
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
                <col className="w-[6.5%]" />
                <col className="w-[6.5%]" />
                <col className="w-[7.5%]" />
                <col className="w-[15%]" />
                <col className="w-[5.5%]" />
                <col className="w-[6.5%]" />
              </colgroup>

              <thead>
                <tr>
                  <th
                    colSpan={15}
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
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => {
                  const hasError = invalidRowIds.includes(row.id);
                  const isActiveRow = activeRowId === row.id;
                  const showSuggestions = isActiveRow && activeSuggestions.length > 0;
                  const netDays = calculateNetDays(row, rows);

                  return (
                    <tr key={row.id} className="bg-white">
                      <td className="border border-slate-300 px-2 py-2 text-center align-middle">{row.vathmos}</td>
                      <td className="border border-slate-300 px-2 py-2 text-center align-middle">{row.eid}</td>
                      <td className="border border-slate-300 px-2 py-2 align-middle">{row.eponymo}</td>
                      <td className="border border-slate-300 px-2 py-2 align-middle">{row.onoma}</td>
                      <td className="border border-slate-300 px-2 py-2 text-center align-middle">{row.ama}</td>
                      <td className="border border-slate-300 bg-slate-50 px-2 py-2 align-middle">
                        {row.epiteleioMonadaYpiresia}
                      </td>
                      <td className="border border-slate-300 bg-slate-50 px-2 py-2 align-middle">
                        {row.kladosMoiraAllo}
                      </td>
                      <td className="border border-slate-300 bg-slate-50 px-2 py-2 align-middle">
                        {row.dieythynsiEpistasiaAllo}
                      </td>
                      <td className="border border-slate-300 bg-slate-50 px-2 py-2 align-middle">
                        {row.tmimaGrafeioAllo}
                      </td>
                      <td className="border border-slate-300 px-2 py-2 text-center align-middle">
                        {formatDate(row.apo)}
                      </td>
                      <td className="border border-slate-300 px-2 py-2 text-center align-middle">
                        {formatDate(row.eos)}
                      </td>
                      <td className="border border-slate-300 bg-cyan-50 px-2 py-2 text-center font-semibold align-middle">
                        {row.movementType}
                      </td>
                      <td
                        className={`relative border px-2 py-1.5 align-top ${
                          hasError ? 'border-rose-300 bg-rose-50' : 'border-slate-300 bg-amber-50'
                        }`}
                      >
                        <div>
                          <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9.]*"
                            value={row.taxinomisiKodikaPinaka1Kai62}
                            onChange={handleClassificationChange(row.id)}
                            onFocus={() => handleClassificationFocus(row.id)}
                            onBlur={() => handleClassificationBlur(row.id)}
                            placeholder="π.χ. 1.2.3"
                            className="w-full rounded bg-transparent px-2 py-1 text-[10px] outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:bg-cyan-50 focus:ring-cyan-200 md:text-[11px]"
                          />

                          {showSuggestions ? (
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
                        {row.imeres}
                      </td>
                      <td className="border border-slate-300 bg-sky-100 px-2 py-2 text-center font-bold align-middle">
                        {netDays ?? '-'}
                      </td>
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
