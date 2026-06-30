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

export default function ProsopikoForm() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ProsopikoRow[]>([]);
  const [classificationOptions, setClassificationOptions] = useState<ProsopikoClassificationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

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
    setValidationMessage('');
  };

  const handleClassificationBlur = (rowId: string) => {
    window.setTimeout(() => {
      setRows((currentRows) =>
        currentRows.map((row) => {
          if (row.id !== rowId) {
            return row;
          }

          const trimmedValue = row.taxinomisiKodikaPinaka1Kai62.trim();

          if (trimmedValue.length === 0) {
            return row;
          }

          if (!hasMatchingClassificationOption(trimmedValue, classificationOptions)) {
            return {
              ...row,
              taxinomisiKodikaPinaka1Kai62: '',
            };
          }

          return row;
        }),
      );

      setActiveRowId((currentRowId) => (currentRowId === rowId ? null : currentRowId));
    }, 120);
  };

  const handleSave = () => {
    const hasInvalidRequiredField = rows.some(
      (row) =>
        row.taxinomisiKodikaPinaka1Kai62.trim().length === 0 ||
        !isValidClassificationCode(row.taxinomisiKodikaPinaka1Kai62.trim()) ||
        !hasMatchingClassificationOption(row.taxinomisiKodikaPinaka1Kai62.trim(), classificationOptions),
    );

    if (hasInvalidRequiredField) {
      setValidationMessage(
        'Πρέπει να συμπληρωθούν όλα τα πεδία ταξινόμησης με έγκυρο διαθέσιμο κωδικό από τις επιλογές, π.χ. 1 ή 1.2 ή 1.2.3.',
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
              Οι κωδικοί ταξινόμησης έρχονται από mock δεδομένα και εμφανίζονται σαν διαθέσιμες επιλογές όσο γράφει ο χρήστης.
            </p>
          </div>
        </div>

        {validationMessage ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {validationMessage}
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-300 bg-slate-50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] border-collapse text-[10px] text-slate-800 md:text-[11px] xl:min-w-0">
              <colgroup>
                <col className="w-[6%]" />
                <col className="w-[4.5%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[6%]" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[6.5%]" />
                <col className="w-[6.5%]" />
                <col className="w-[16%]" />
                <col className="w-[5.5%]" />
              </colgroup>

              <thead>
                <tr>
                  <th
                    colSpan={13}
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
                  <th className="border border-slate-400 bg-amber-50 px-2 py-2.5 text-center font-bold leading-tight">
                    Ταξινόμηση κατά Κώδικα Πίνακα 1 και του Πίνακα 6.2
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">ΗΜΕΡΕΣ</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => {
                  const hasError =
                    validationMessage &&
                    (row.taxinomisiKodikaPinaka1Kai62.trim().length === 0 ||
                      !isValidClassificationCode(row.taxinomisiKodikaPinaka1Kai62.trim()) ||
                      !hasMatchingClassificationOption(
                        row.taxinomisiKodikaPinaka1Kai62.trim(),
                        classificationOptions,
                      ));
                  const isActiveRow = activeRowId === row.id;
                  const showSuggestions = isActiveRow && activeSuggestions.length > 0;

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
                      <td
                        className={`border px-2 py-1.5 align-top ${
                          hasError ? 'border-rose-300 bg-rose-50' : 'border-slate-300 bg-amber-50'
                        }`}
                      >
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9.]*"
                            value={row.taxinomisiKodikaPinaka1Kai62}
                            onChange={handleClassificationChange(row.id)}
                            onFocus={() => setActiveRowId(row.id)}
                            onBlur={() => handleClassificationBlur(row.id)}
                            placeholder="π.χ. 1.2.3"
                            className="w-full rounded bg-transparent px-2 py-1 text-[10px] outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:bg-cyan-50 focus:ring-cyan-200 md:text-[11px]"
                          />

                          {showSuggestions ? (
                            <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-100">
                              <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 md:text-[11px]">
                                Διαθέσιμες επιλογές
                              </div>
                              <div className="max-h-[126px] overflow-y-auto">
                              {activeSuggestions.map((option) => (
                                <button
                                  key={option.code}
                                  type="button"
                                  onMouseDown={() => handleSuggestionSelect(row.id, option.code)}
                                  className="flex w-full items-start justify-between gap-3 border-b border-slate-100 px-3 py-2.5 text-left transition-colors duration-150 last:border-b-0 hover:bg-cyan-50"
                                >
                                  <span className="min-w-[52px] rounded-md bg-sky-100 px-2 py-0.5 text-center font-bold text-sky-700">
                                    {option.code}
                                  </span>
                                  <span className="text-[10px] leading-5 text-slate-500 md:text-[11px]">
                                    {option.description}
                                  </span>
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
