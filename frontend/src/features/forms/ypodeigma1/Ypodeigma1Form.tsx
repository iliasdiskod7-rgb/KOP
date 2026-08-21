import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { canUseAuthenticatedApi } from '../../../api/httpClient';
import { upsertYpodeigma2Submission } from '../ypodeigma2/submissionStorage';
import { buildYpodeigma1SavePayload } from './buildYpodeigma1SavePayload';
import { calculateLeafGrandTotal, isLeafRow, parseYpodeigma1Amount } from './helpers';
import { fetchYpodeigma1ForMoira, saveYpodeigma1Submission } from './ypodeigma1Api';
import type {
  Ypodeigma1CacheByMoira,
  Ypodeigma1FormActions,
  Ypodeigma1MoiraCacheEntry,
  Ypodeigma1TableARow,
  Ypodeigma1TableBRow,
  Ypodeigma1TableCRow,
} from './types';
import Ypodeigma1Section1ATable from './Ypodeigma1Section1ATable';
import Ypodeigma1Section1BTable from './Ypodeigma1Section1BTable';

type Ypodeigma1FormProps = {
  selectedMonadaId: string | null;
  selectedMonadaLabel: string | null;
  selectedMoiraId: string | null;
  selectedMoiraLabel: string | null;
  selectedEtos: number | null;
  selectedEtosStatus: 'editable' | 'view' | null;
  selectedEtosSource: 'existing' | 'new' | null;
  onRegisterActions?: (actions: Ypodeigma1FormActions | null) => void;
  onDirtyChange?: (isDirty: boolean) => void;
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

function updateTable1CRows(
  rows: Ypodeigma1TableCRow[],
  rowId: string,
  rawValue: string,
): Ypodeigma1TableCRow[] {
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

function calculateGrandTotal(entry: Ypodeigma1MoiraCacheEntry | null) {
  if (!entry) {
    return 0;
  }

  return (
    calculateLeafGrandTotal(entry.table1ARows) +
    calculateLeafGrandTotal(entry.table1BRows) +
    calculateLeafGrandTotal(entry.table1CRows)
  );
}

function calculateRowCount(entry: Ypodeigma1MoiraCacheEntry | null) {
  if (!entry) {
    return 0;
  }

  return entry.table1ARows.length + entry.table1BRows.length + entry.table1CRows.length;
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
  onDirtyChange,
}: Ypodeigma1FormProps) {
  const [cacheByMoira, setCacheByMoira] = useState<Ypodeigma1CacheByMoira>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMoiraId, setLoadingMoiraId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const previousSelectionRef = useRef<string>('');

  useEffect(() => {
    const selectionKey = `${selectedEtos ?? 'none'}-${selectedEtosStatus ?? 'none'}-${selectedEtosSource ?? 'none'}`;

    if (previousSelectionRef.current === selectionKey) {
      return;
    }

    previousSelectionRef.current = selectionKey;
    setCacheByMoira({});
    onDirtyChange?.(false);
  }, [onDirtyChange, selectedEtos, selectedEtosSource, selectedEtosStatus]);

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
      setLoadError(null);

      try {
        const response = await fetchYpodeigma1ForMoira({
          monadaId: selectedMonadaId,
          monadaLabel: selectedMonadaLabel,
          moiraId: selectedMoiraId,
          moiraLabel: selectedMoiraLabel,
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
            responsibleOrgUnitId: response.responsibleOrgUnitId,
            monadaId: response.monadaId,
            monadaLabel: response.monadaLabel,
            moiraId: response.moiraId,
            moiraLabel: response.moiraLabel,
            etos: response.etos,
            status: response.status,
            table1ARows: response.table1ARows,
            table1BRows: response.table1BRows,
            table1CRows: response.table1CRows,
          },
        }));
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error ? error.message : 'Η φόρτωση του Υποδείγματος 1 απέτυχε.',
          );
        }
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
  }, [
    cacheByMoira,
    selectedEtos,
    selectedEtosSource,
    selectedEtosStatus,
    selectedMonadaId,
    selectedMonadaLabel,
    selectedMoiraId,
    selectedMoiraLabel,
  ]);

  const currentEntry = useMemo(
    () => getCurrentEntry(cacheByMoira, selectedMoiraId),
    [cacheByMoira, selectedMoiraId],
  );
  const isEditable = currentEntry?.status === 'editable';
  const totalAmount = calculateGrandTotal(currentEntry);
  const rowCount = calculateRowCount(currentEntry);

  const persistSubmission = useCallback(
    async (action: 'SaveDraft' | 'Submit', localStatus: 'pending-submission' | 'submitted') => {
      if (!currentEntry || !isEditable) {
        throw new Error('Η συγκεκριμένη εγγραφή είναι διαθέσιμη μόνο για προβολή.');
      }

      if (canUseAuthenticatedApi()) {
        await saveYpodeigma1Submission(currentEntry, action);
      }

      const payload = buildYpodeigma1SavePayload({
        monadaId: selectedMonadaId,
        etos: selectedEtos,
        cacheByMoira,
      });

      // Προσωρινή προβολή μέχρι το MySubmissions να συνδεθεί με backend endpoint.
      upsertYpodeigma2Submission({
        id: `ypodeigma1-${selectedEtos ?? 'unknown'}-${selectedMoiraId ?? 'unknown'}`,
        createdAt: new Date().toISOString(),
        ypodeigmaLabel: 'Υπόδειγμα 1',
        pterygaLabel: selectedMonadaLabel ?? selectedMonadaId,
        etos: selectedEtos,
        sectionId: 'Υπόδειγμα 1',
        sectionTitle: currentEntry.moiraLabel ?? selectedMoiraLabel ?? selectedMoiraId ?? 'Χωρίς μοίρα',
        totalAmount,
        moiraCount: payload.moires.length,
        rowCount,
        status: localStatus,
      });

      onDirtyChange?.(false);
    },
    [
      cacheByMoira,
      currentEntry,
      isEditable,
      onDirtyChange,
      rowCount,
      selectedEtos,
      selectedMonadaId,
      selectedMonadaLabel,
      selectedMoiraId,
      selectedMoiraLabel,
      totalAmount,
    ],
  );

  useEffect(() => {
    if (!onRegisterActions) {
      return;
    }

    onRegisterActions({
      saveDraft: () => persistSubmission('SaveDraft', 'pending-submission'),
      submitFinal: () => persistSubmission('Submit', 'submitted'),
    });

    return () => {
      onRegisterActions(null);
    };
  }, [
    onRegisterActions,
    persistSubmission,
  ]);

  const handleTable1AAmountChange = (rowId: string, rawValue: string) => {
    const targetRow = currentEntry?.table1ARows.find((row) => row.id === rowId);

    if (
      !selectedMoiraId ||
      !isEditable ||
      !currentEntry ||
      !targetRow ||
      !isLeafRow(targetRow, currentEntry.table1ARows)
    ) {
      return;
    }

    onDirtyChange?.(true);

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
    const targetRow = currentEntry?.table1BRows.find((row) => row.id === rowId);

    if (
      !selectedMoiraId ||
      !isEditable ||
      !currentEntry ||
      !targetRow ||
      !isLeafRow(targetRow, currentEntry.table1BRows)
    ) {
      return;
    }

    onDirtyChange?.(true);

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

  const handleTable1CAmountChange = (rowId: string, rawValue: string) => {
    const targetRow = currentEntry?.table1CRows.find((row) => row.id === rowId);

    if (
      !selectedMoiraId ||
      !isEditable ||
      !currentEntry ||
      !targetRow ||
      !isLeafRow(targetRow, currentEntry.table1CRows)
    ) {
      return;
    }

    onDirtyChange?.(true);

    setCacheByMoira((currentCache) => {
      const currentEntryForMoira = currentCache[selectedMoiraId];

      if (!currentEntryForMoira) {
        return currentCache;
      }

      return {
        ...currentCache,
        [selectedMoiraId]: {
          ...currentEntryForMoira,
          table1CRows: updateTable1CRows(currentEntryForMoira.table1CRows, rowId, rawValue),
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

  if (loadError && !currentEntry) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
        <h1 className="text-xl font-bold">ΥΠΟΔΕΙΓΜΑ 1</h1>
        <p className="mt-2 text-sm">{loadError}</p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg lg:p-5">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-slate-800">Υπόδειγμα 1</h1>
          <p className="text-sm text-slate-600">
            Εμφανίζεται μόνο η επιλεγμένη μοίρα {currentEntry?.moiraLabel ?? selectedMoiraLabel ?? selectedMoiraId}
            {selectedEtos ? ` - Έτος ${selectedEtos}` : ''}
          </p>
        </div>

        {currentEntry ? (
          <div
            className={`mb-3 rounded-xl border px-4 py-2.5 text-sm ${
              currentEntry.status === 'editable'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {currentEntry.status === 'editable'
              ? 'Η συγκεκριμένη χρήση είναι editable και επιτρέπει μεταβολές μόνο στα leaf κελιά.'
              : 'Η συγκεκριμένη χρήση είναι σε κατάσταση προβολής και τα ποσά δεν επεξεργάζονται.'}
          </div>
        ) : null}

        {currentEntry ? (
          <div className="space-y-4">
            <Ypodeigma1Section1ATable
              entry={currentEntry}
              isEditable={isEditable}
              onAmountChange={handleTable1AAmountChange}
            />

            <Ypodeigma1Section1BTable
              tableCode="1Β"
              title="Μικτές Αποδοχές Λοιπών Μοιρών-Επιστασιών-Τμημάτων Άμεσης Υποστήριξης Πτητικού Έργου"
              rows={currentEntry.table1BRows}
              isEditable={isEditable}
              onAmountChange={handleTable1BAmountChange}
            />

            <Ypodeigma1Section1BTable
              tableCode="1Γ"
              title="Μικτές Αποδοχές Λοιπών Μοιρών-Επιστασιών-Τμημάτων Έμμεσης Υποστήριξης Πτητικού Έργου"
              rows={currentEntry.table1CRows}
              isEditable={isEditable}
              onAmountChange={handleTable1CAmountChange}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
