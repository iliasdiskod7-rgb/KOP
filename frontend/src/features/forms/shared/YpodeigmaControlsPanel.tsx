import { useMemo } from 'react';
import type { AppUserRole } from '../../../types/auth';
import type { OrgUnitOption, YpodeigmaControlsOptions, YpodeigmaControlsValue } from './types';

type YpodeigmaControlsPanelProps = {
  role: AppUserRole;
  value: YpodeigmaControlsValue;
  options: YpodeigmaControlsOptions;
  showTableSelection: boolean;
  showMoiraSelection?: boolean;
  isLoading?: boolean;
  isStartingNewYear?: boolean;
  onChange: (nextValue: YpodeigmaControlsValue) => void;
  onRetrieve: () => void;
  onStartNewYear: () => void;
};

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M7 2h2v2h6V2h2v2h1.5A2.5 2.5 0 0 1 21 6.5v12A2.5 2.5 0 0 1 18.5 21h-13A2.5 2.5 0 0 1 3 18.5v-12A2.5 2.5 0 0 1 5.5 4H7V2Zm11.5 8h-13v8.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V10Zm-13-2h13V6.5a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5V8Z" />
      <path d="M12.8 12.2a1 1 0 0 1 1.4 0l1.4 1.4 2-2a1 1 0 1 1 1.4 1.4l-2.7 2.7a1 1 0 0 1-1.4 0l-2.1-2.1a1 1 0 0 1 0-1.4Z" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 4v10h16V8H4Zm4-2H4v1h4V6Zm1 1h5V6H9v1Zm6 0h5V6h-5v1ZM6 10h3v2H6v-2Zm4 0h8v2h-8v-2Zm-4 4h3v2H6v-2Zm4 0h8v2h-8v-2Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm8.9 11.5 2.6 2.6-1.4 1.4-2.6-2.6 1.4-1.4Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
    </svg>
  );
}

function getControlClassName(isDisabled = false) {
  return `w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
    isDisabled
      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
      : 'border-slate-200 bg-white text-slate-700 shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
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
  showTableSelection,
  showMoiraSelection = true,
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
    <section className="space-y-2">
      <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        <div className="mb-2.5 flex items-center gap-2.5 text-sky-700">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50">
            <CalendarIcon />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-sky-700">Έτος αναφοράς</h2>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <div className="space-y-2 xl:border-r xl:border-slate-200 xl:pr-3">
            <div>
              <h3 className="text-sm font-bold text-sky-700">Ανάκτηση δεδομένων παρελθοντικών ετών</h3>
            </div>

            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">Έτος</span>
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
                  <option value="">Επιλέξτε έτος...</option>
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
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
              >
                <SearchIcon />
                Ανάκτηση
              </button>
            </div>

            <p className="max-w-[34rem] text-[11px] leading-5 text-slate-500">
              Φορτώνει τα δεδομένα του επιλεγμένου έτους.
            </p>
          </div>

          {role !== 'admin' ? (
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-bold text-sky-700">Καταχώρηση δεδομένων για νέο έτος</h3>
              </div>

              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-700">Νέο έτος</span>
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
                  className="flex items-center justify-center gap-2 rounded-lg border border-blue-500 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-300"
                >
                  <PlusIcon />
                  {isStartingNewYear ? 'Έναρξη...' : 'Έναρξη'}
                </button>
              </div>

              <p className="max-w-[34rem] text-[11px] leading-5 text-slate-500">
                Δημιουργεί νέους πίνακες καταχώρησης δεδομένων.
              </p>
            </div>
          ) : (
            <div className="hidden xl:block" />
          )}
        </div>
      </div>

      {showTableSelection ? (
        <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div className="mb-1.5 flex items-center gap-2 text-sky-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
              <TableIcon />
            </div>
            <h2 className="text-sm font-bold text-sky-700">Προβολή πίνακα</h2>
          </div>

          {hasSelectedYear ? (
          <div
            className={`grid gap-2 ${
              showMoiraSelection
                ? 'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:max-w-[58rem]'
                : 'max-w-[29rem]'
            }`}
          >
            <label className="block min-w-0">
              <span className="mb-0.5 block text-[11px] font-medium text-slate-700">Μονάδα</span>
              <select
                className={getControlClassName(isLoading)}
                value={value.monadaId ?? ''}
                onChange={(event) => handleMonadaChange(event.target.value)}
                disabled={isLoading}
              >
                <option value="">Επιλέξτε Μονάδα...</option>
                {options.monades.map((monada) => (
                  <option key={monada.id} value={monada.id}>
                    {monada.name}
                  </option>
                ))}
              </select>
            </label>

            {showMoiraSelection ? (
              <label className="block min-w-0">
                <span className="mb-0.5 block text-[11px] font-medium text-slate-700">Μοίρα</span>
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
                    {value.monadaId ? 'Επιλέξτε Μοίρα...' : 'Επιλέξτε πρώτα Μονάδα'}
                  </option>
                  {filteredMoires.map((moira) => (
                    <option key={moira.id} value={moira.id}>
                      {moira.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
