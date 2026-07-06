import { useMemo } from 'react';
import type { OrgUnitOption, YpodeigmaControlsOptions, YpodeigmaControlsValue } from './types';

type YpodeigmaControlsPanelProps = {
  value: YpodeigmaControlsValue;
  options: YpodeigmaControlsOptions;
  isLoading?: boolean;
  onChange: (nextValue: YpodeigmaControlsValue) => void;
  onRetrieve: () => void;
  onStartNewYear: () => void;
  onTemporarySave: () => void;
  onFinalSubmit?: () => void;
};

function getControlClassName(isDisabled = false) {
  return `w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
    isDisabled
      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
      : 'border-slate-200 bg-white text-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
  }`;
}

function getFilteredMoires(moires: OrgUnitOption[], monadaId: string | null) {
  if (!monadaId) {
    return [];
  }

  return moires.filter((moira) => moira.parentId === monadaId);
}

function PrinterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M7 3h10v4H7V3Zm10 8h2a1 1 0 0 1 1 1v4h-3v5H7v-5H4v-4a1 1 0 0 1 1-1h2v2h10v-2Zm-2 8v-4H9v4h6Zm2-10V5H7v4h10Z" />
    </svg>
  );
}

function PaperPlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M3.4 11.1 20.7 3.7a.8.8 0 0 1 1.1.9l-3 14.6a.8.8 0 0 1-1.3.5l-4.4-3.6-2.6 2.5a.8.8 0 0 1-1.3-.5v-4.2L3.9 12.5a.8.8 0 0 1-.5-.7.8.8 0 0 1 .5-.7Zm15.8-5.7-8.4 7.3a.8.8 0 0 0-.3.6v2.9l1.5-1.5a.8.8 0 0 1 1 0l4.1 3.3 2.1-12.6ZM6.8 11.8l3 .8 6.2-5.4-9.2 4.6Z" />
    </svg>
  );
}

export default function YpodeigmaControlsPanel({
  value,
  options,
  isLoading = false,
  onChange,
  onRetrieve,
  onStartNewYear,
  onTemporarySave,
  onFinalSubmit,
}: YpodeigmaControlsPanelProps) {
  const filteredMoires = useMemo(
    () => getFilteredMoires(options.moires, value.monadaId),
    [options.moires, value.monadaId],
  );
  const hasSelectedYear = value.etos !== null;
  const shouldShowActions = hasSelectedYear && value.etosStatus !== 'view';

  const handleMonadaChange = (nextMonadaId: string) => {
    const normalizedMonadaId = nextMonadaId || null;
    const nextMoires = getFilteredMoires(options.moires, normalizedMonadaId);
    const hasExistingMoira = nextMoires.some((moira) => moira.id === value.moiraId);

    onChange({
      ...value,
      monadaId: normalizedMonadaId,
      moiraId: hasExistingMoira ? value.moiraId : null,
    });
  };

  return (
    <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,2.3fr)_minmax(280px,1fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-7 border-b border-slate-100 pb-5">
          <h2 className="text-xl font-bold text-sky-800">Επιλογή Στοιχείων</h2>
          <p className="mt-1 text-sm text-slate-500">
            Επίλεξε πρώτα το έτος και στη συνέχεια τη μονάδα και τη μοίρα για το υπόδειγμα.
          </p>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 shadow-sm">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-sky-700">1. Επιλογή Έτους</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Ανακτήστε υπάρχοντα δεδομένα ή ξεκινήστε νέο έτος αναφοράς.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-600">Έτος</span>
                <select
                  className={getControlClassName(isLoading)}
                  value={value.etos ?? ''}
                  onChange={(event) =>
                    onChange(
                      event.target.value
                        ? {
                            ...value,
                            etos: Number(event.target.value),
                            etosStatus:
                              options.etoi.find((etos) => etos.value === Number(event.target.value))?.status ?? null,
                            etosSource: 'existing',
                          }
                        : {
                            ...value,
                            etos: null,
                            etosStatus: null,
                            etosSource: null,
                          },
                    )
                  }
                  disabled={isLoading}
                >
                  <option value="">Επιλέξτε έτος</option>
                  {options.etoi.map((etos) => (
                    <option key={etos.value} value={etos.value}>
                      {etos.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={onRetrieve}
                className="mt-[29px] rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-sky-700"
              >
                Ανάκτηση
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-600">Νέο έτος</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={value.neoEtos}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      neoEtos: event.target.value,
                    })
                  }
                  placeholder="π.χ. 2027"
                  className={getControlClassName(isLoading)}
                  disabled={isLoading}
                />
              </label>

              <button
                type="button"
                onClick={onStartNewYear}
                className="mt-[29px] rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-sky-700"
              >
                Έναρξη
              </button>
            </div>

            {value.etos && value.etosStatus ? (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                  value.etosStatus === 'editable'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}
              >
                {value.etosSource === 'new'
                  ? `Το νέο έτος ${value.etos} είναι διαθέσιμο για καταχώριση και είναι editable.`
                  : value.etosStatus === 'editable'
                    ? `Το έτος ${value.etos} έχει δεδομένα από το backend και είναι editable.`
                    : `Το έτος ${value.etos} έχει δεδομένα από το backend και είναι διαθέσιμο μόνο για προβολή.`}
              </div>
            ) : null}
          </div>

          {hasSelectedYear ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 shadow-sm">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-sky-700">2. Επιλογή Μονάδας και Μοίρας</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Μετά την επιλογή του έτους, επιλέξτε τη μονάδα και τη μοίρα που αφορά το υπόδειγμα.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-600">Μονάδα</span>
                  <select
                    className={getControlClassName(isLoading)}
                    value={value.monadaId ?? ''}
                    onChange={(event) => handleMonadaChange(event.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Επιλέξτε μονάδα</option>
                    {options.monades.map((monada) => (
                      <option key={monada.id} value={monada.id}>
                        {monada.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-600">Μοίρα</span>
                  <select
                    className={getControlClassName(isLoading || !value.monadaId)}
                    value={value.moiraId ?? ''}
                    onChange={(event) =>
                      onChange({
                        ...value,
                        moiraId: event.target.value || null,
                      })
                    }
                    disabled={isLoading || !value.monadaId}
                  >
                    <option value="">
                      {value.monadaId ? 'Επιλέξτε μοίρα' : 'Επίλεξε πρώτα μονάδα'}
                    </option>
                    {filteredMoires.map((moira) => (
                      <option key={moira.id} value={moira.id}>
                        {moira.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-4 text-sm text-slate-500">
              Μόλις επιλέξετε έτος, θα εμφανιστεί εδώ η επιλογή μονάδας και μοίρας.
            </div>
          )}
        </div>
      </div>

      {shouldShowActions ? (
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-sky-800">Ενέργειες</h2>
            <p className="mt-1 text-sm text-slate-500">
              Τα κουμπιά είναι έτοιμα για σύνδεση με κάθε υπόδειγμα στο επόμενο βήμα.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={onTemporarySave}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-sky-700"
            >
              <PrinterIcon />
              Προσωρινή Αποθήκευση
            </button>

            <button
              type="button"
              onClick={onFinalSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-blue-800"
            >
              <PaperPlaneIcon />
              Οριστική Υποβολή
            </button>
          </div>
        </aside>
      ) : (
        <aside className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-500">Ενέργειες</h2>
            <p className="text-sm text-slate-500">
              {value.etosStatus === 'view'
                ? 'Οι ενέργειες δεν εμφανίζονται, γιατί το επιλεγμένο έτος είναι μόνο για προβολή και έχει ήδη ολοκληρωθεί.'
                : 'Οι ενέργειες θα εμφανιστούν μόλις επιλέξετε έτος και στη συνέχεια μονάδα ή μοίρα.'}
            </p>
          </div>
        </aside>
      )}
    </section>
  );
}
