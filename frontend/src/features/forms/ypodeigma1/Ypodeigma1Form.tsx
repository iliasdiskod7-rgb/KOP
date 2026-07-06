import { useEffect, useMemo, useRef, useState } from 'react';
import { buildYpodeigma1SavePayload } from './buildYpodeigma1SavePayload';
import { parseYpodeigma1Amount } from './helpers';
import { fetchYpodeigma1ForMoira } from './mockYpodeigma1Api';
import type {
  Ypodeigma1CacheByMoira,
  Ypodeigma1FormActions,
  Ypodeigma1MoiraCacheEntry,
  Ypodeigma1TableARow,
  Ypodeigma1TableBRow,
} from './types';

type Ypodeigma1FormProps = {
  selectedMonadaId: string | null;
  selectedMonadaLabel: string | null;
  selectedMoiraId: string | null;
  selectedMoiraLabel: string | null;
  selectedEtos: number | null;
  selectedEtosStatus: 'editable' | 'view' | null;
  selectedEtosSource: 'existing' | 'new' | null;
  onRegisterActions?: (actions: Ypodeigma1FormActions) => void;
};

function updateTable1ARows(
  rows: Ypodeigma1TableARow[],
  rowId: string,
  rawValue: string,
): Ypodeigma1TableARow[] {
  return rows.map((row) =>
    row.id === rowId
      ? {
          ...row,
          amount: parseYpodeigma1Amount(rawValue),
        }
      : row,
  );
}

function updateTable1BRows(
  rows: Ypodeigma1TableBRow[],
  rowId: string,
  rawValue: string,
): Ypodeigma1TableBRow[] {
  return rows.map((row) =>
    row.id === rowId
      ? {
          ...row,
          amount: parseYpodeigma1Amount(rawValue),
        }
      : row,
  );
}

function getCurrentEntry(
  cacheByMoira: Ypodeigma1CacheByMoira,
  selectedMoiraId: string | null,
): Ypodeigma1MoiraCacheEntry | null {
  if (!selectedMoiraId) {
    return null;
  }

  return cacheByMoira[selectedMoiraId] ?? null;
}

export default function Ypodeigma1Form({
  selectedMonadaId,
  selectedMonadaLabel,
  selectedMoiraId,
  selectedMoiraLabel,
  selectedEtos,
  selectedEtosStatus,
  selectedEtosSource,
  onRegisterActions,
}: Ypodeigma1FormProps) {
  const [cacheByMoira, setCacheByMoira] = useState<Ypodeigma1CacheByMoira>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMoiraId, setLoadingMoiraId] = useState<string | null>(null);
  const previousSelectionRef = useRef<string>('');

  useEffect(() => {
    const selectionKey = `${selectedEtos ?? 'none'}-${selectedEtosStatus ?? 'none'}-${selectedEtosSource ?? 'none'}`;

    if (previousSelectionRef.current === selectionKey) {
      return;
    }

    previousSelectionRef.current = selectionKey;
    setCacheByMoira({});
  }, [selectedEtos, selectedEtosSource, selectedEtosStatus]);

  useEffect(() => {
    if (!selectedEtos || !selectedMonadaId || !selectedMoiraId) {
      return;
    }

    if (cacheByMoira[selectedMoiraId]) {
      return;
    }

    let isMounted = true;

    const loadMoiraData = async () => {
      setIsLoading(true);
      setLoadingMoiraId(selectedMoiraId);

      try {
        const response = await fetchYpodeigma1ForMoira({
          monadaId: selectedMonadaId,
          moiraId: selectedMoiraId,
          etos: selectedEtos,
          etosStatus: selectedEtosStatus,
          etosSource: selectedEtosSource,
        });

        if (!isMounted) {
          return;
        }

        setCacheByMoira((currentCache) => ({
          ...currentCache,
          [selectedMoiraId]: {
            monadaId: response.monadaId,
            monadaLabel: response.monadaLabel,
            moiraId: response.moiraId,
            moiraLabel: response.moiraLabel,
            etos: response.etos,
            status: response.status,
            table1ARows: response.table1ARows,
            table1BRows: response.table1BRows,
          },
        }));
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setLoadingMoiraId(null);
        }
      }
    };

    void loadMoiraData();

    return () => {
      isMounted = false;
    };
  }, [cacheByMoira, selectedEtos, selectedEtosSource, selectedEtosStatus, selectedMonadaId, selectedMoiraId]);

  const currentEntry = useMemo(
    () => getCurrentEntry(cacheByMoira, selectedMoiraId),
    [cacheByMoira, selectedMoiraId],
  );
  const isEditable = currentEntry?.status === 'editable';

  useEffect(() => {
    if (!onRegisterActions) {
      return;
    }

    onRegisterActions({
      saveDraft: () => {
        console.log(
          'Ypodeigma 1 προσωρινή αποθήκευση',
          buildYpodeigma1SavePayload({
            monadaId: selectedMonadaId,
            etos: selectedEtos,
            cacheByMoira,
          }),
        );
      },
      submitFinal: () => {
        console.log(
          'Ypodeigma 1 οριστική υποβολή',
          buildYpodeigma1SavePayload({
            monadaId: selectedMonadaId,
            etos: selectedEtos,
            cacheByMoira,
          }),
        );
      },
    });
  }, [cacheByMoira, onRegisterActions, selectedEtos, selectedMonadaId]);

  const handleTable1AAmountChange = (rowId: string, rawValue: string) => {
    if (!selectedMoiraId || !isEditable) {
      return;
    }

    setCacheByMoira((currentCache) => {
      const currentEntryForMoira = currentCache[selectedMoiraId];

      if (!currentEntryForMoira) {
        return currentCache;
      }

      return {
        ...currentCache,
        [selectedMoiraId]: {
          ...currentEntryForMoira,
          table1ARows: updateTable1ARows(currentEntryForMoira.table1ARows, rowId, rawValue),
        },
      };
    });
  };

  const handleTable1BAmountChange = (rowId: string, rawValue: string) => {
    if (!selectedMoiraId || !isEditable) {
      return;
    }

    setCacheByMoira((currentCache) => {
      const currentEntryForMoira = currentCache[selectedMoiraId];

      if (!currentEntryForMoira) {
        return currentCache;
      }

      return {
        ...currentCache,
        [selectedMoiraId]: {
          ...currentEntryForMoira,
          table1BRows: updateTable1BRows(currentEntryForMoira.table1BRows, rowId, rawValue),
        },
      };
    });
  };

  if (!selectedEtos || !selectedMonadaId || !selectedMoiraId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ 1</h1>
        <p className="mt-4 text-sm text-slate-600">
          Επιλέξτε έτος, μονάδα και μοίρα για να φορτωθεί το Υπόδειγμα 1.
        </p>
      </div>
    );
  }

  if (isLoading && loadingMoiraId === selectedMoiraId && !currentEntry) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ 1</h1>
        <p className="mt-4 text-sm text-slate-600">
          Φόρτωση στοιχείων για {selectedMonadaLabel ?? selectedMonadaId} / {selectedMoiraLabel ?? selectedMoiraId}
          ...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ 1</h1>
          <p className="mt-2 text-sm text-slate-600">
            Πίνακας 1Α για {currentEntry?.monadaLabel ?? selectedMonadaLabel ?? selectedMonadaId} /{' '}
            {currentEntry?.moiraLabel ?? selectedMoiraLabel ?? selectedMoiraId}
            {selectedEtos ? ` - Έτος ${selectedEtos}` : ''}
          </p>
        </div>

        {currentEntry ? (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
              currentEntry.status === 'editable'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {currentEntry.status === 'editable'
              ? 'Η συγκεκριμένη χρήση είναι editable και επιτρέπει μεταβολές στα ποσά.'
              : 'Η συγκεκριμένη χρήση είναι σε κατάσταση προβολής και τα ποσά δεν επεξεργάζονται.'}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Κωδικός</th>
                <th className="border border-slate-300 px-3 py-2 text-left font-semibold">
                  Τίτλος Στοιχείου Κόστους
                </th>
                <th className="border border-slate-300 px-3 py-2 text-right font-semibold">
                  {currentEntry?.moiraLabel ?? selectedMoiraLabel ?? selectedMoiraId}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEntry?.table1ARows.map((row) => (
                <tr key={row.id} className="bg-white">
                  <td className="border border-slate-300 px-3 py-2 font-medium">{row.code}</td>
                  <td className="border border-slate-300 px-3 py-2">{row.title}</td>
                  <td className="border border-slate-300 px-3 py-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={row.amount ?? ''}
                      onChange={(event) => handleTable1AAmountChange(row.id, event.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-right outline-none transition ${
                        isEditable
                          ? 'border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
                          : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                      }`}
                      placeholder="0"
                      disabled={!isEditable}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-800">Πίνακας 1Β</h2>
          <p className="mt-2 text-sm text-slate-600">
            Ο Πίνακας 1Β εμφανίζεται μόνο για τη μοίρα που έχει επιλεγεί από το dropdown.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Κωδικός</th>
                <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Περιγραφή</th>
                <th className="border border-slate-300 px-3 py-2 text-right font-semibold">
                  {currentEntry?.moiraLabel ?? selectedMoiraLabel ?? selectedMoiraId}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEntry?.table1BRows.map((row) => (
                <tr key={row.id} className="bg-white">
                  <td className="border border-slate-300 px-3 py-2 font-medium">{row.code}</td>
                  <td className="border border-slate-300 px-3 py-2">{row.title}</td>
                  <td className="border border-slate-300 px-3 py-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={row.amount ?? ''}
                      onChange={(event) => handleTable1BAmountChange(row.id, event.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-right outline-none transition ${
                        isEditable
                          ? 'border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
                          : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                      }`}
                      placeholder="0"
                      disabled={!isEditable}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Η αποθήκευση οργανώνεται ανά μοίρα και διατηρεί τα δεδομένα της τρέχουσας επιλογής για το συγκεκριμένο
          έτος.
        </div>
      </section>
    </div>
  );
}
