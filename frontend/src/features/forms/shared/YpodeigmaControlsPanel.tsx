import { useMemo } from 'react';
import type { AppUserRole } from '../../../types/auth';
import type { OrgUnitOption, YpodeigmaControlsOptions, YpodeigmaControlsValue } from './types';

type YpodeigmaControlsPanelProps = {
  role: AppUserRole;
  value: YpodeigmaControlsValue;
  options: YpodeigmaControlsOptions;
  isLoading?: boolean;
  isStartingNewYear?: boolean;
  onChange: (nextValue: YpodeigmaControlsValue) => void;
  onRetrieve: () => void;
  onStartNewYear: () => void;
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

function sanitizeYearInput(rawValue: string) {
  return rawValue.replace(/\D/g, '').slice(0, 4);
}

export default function YpodeigmaControlsPanel({
  role,
  value,
  options,
  isLoading = false,
  isStartingNewYear = false,
  onChange,
  onRetrieve,
  onStartNewYear,
}: YpodeigmaControlsPanelProps) {
  const filteredMoires = useMemo(
    () => getFilteredMoires(options.moires, value.monadaId),
    [options.moires, value.monadaId],
  );
  const hasSelectedYear = value.etos !== null;

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
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-7 border-b border-slate-100 pb-5">
        <h2 className="text-xl font-bold text-sky-800">Επιλογή Στοιχείων</h2>
        <p className="mt-1 text-sm text-slate-500">
          Επιλέξτε πρώτα έτος και στη συνέχεια μονάδα και μοίρα για να φορτωθεί το υπόδειγμα.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
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
              disabled={isLoading}
              className="mt-[29px] rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:scale-100"
            >
              Ανάκτηση
            </button>
          </div>

          {role !== 'admin' ? (
            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-600">Νέο Έτος</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={value.neoEtos}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      neoEtos: sanitizeYearInput(event.target.value),
                    })
                  }
                  placeholder="π.χ. 2027"
                  className={getControlClassName(isLoading || isStartingNewYear)}
                  disabled={isLoading || isStartingNewYear}
                />
              </label>

              <button
                type="button"
                onClick={onStartNewYear}
                disabled={isLoading || isStartingNewYear}
                className="mt-[29px] rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:scale-100"
              >
                {isStartingNewYear ? 'Έναρξη...' : 'Έναρξη'}
              </button>
            </div>
          ) : null}

          {role !== 'admin' && value.etos && value.etosStatus ? (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                value.etosStatus === 'editable'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}
            >
              {value.etosSource === 'new'
                ? `Το νέο έτος ${value.etos} είναι διαθέσιμο για νέα καταχώριση.`
                : value.etosStatus === 'editable'
                  ? `Το έτος ${value.etos} είναι διαθέσιμο για επεξεργασία.`
                  : `Το έτος ${value.etos} είναι διαθέσιμο μόνο για προβολή.`}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-sky-700">2. Επιλογή Μονάδας και Μοίρας</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Η μοίρα φιλτράρεται αυτόματα με βάση τη μονάδα που θα επιλέξετε.
            </p>
          </div>

          {hasSelectedYear ? (
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
                    {value.monadaId ? 'Επιλέξτε μοίρα' : 'Επιλέξτε πρώτα μονάδα'}
                  </option>
                  {filteredMoires.map((moira) => (
                    <option key={moira.id} value={moira.id}>
                      {moira.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-4 text-sm text-slate-500">
              Μόλις επιλέξετε έτος, εδώ θα εμφανιστούν η μονάδα και η μοίρα.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
