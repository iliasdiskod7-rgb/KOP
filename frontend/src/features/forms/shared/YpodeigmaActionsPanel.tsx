import type { AppUserRole } from '../../../types/auth';

type YpodeigmaActionsPanelProps = {
  role: AppUserRole;
  isVisible: boolean;
  isBusy?: boolean;
  isReadOnlyYear?: boolean;
  onTemporarySave: () => void | Promise<void>;
  onFinalSubmit?: () => void | Promise<void>;
  onReturnForCorrection?: () => void | Promise<void>;
};

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

function ReturnIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M9.4 6.3 4.7 11l4.7 4.7 1.4-1.4-2.3-2.3H15a3 3 0 0 1 0 6h-4v2h4a5 5 0 0 0 0-10H8.5l2.3-2.3-1.4-1.4Z" />
    </svg>
  );
}

export default function YpodeigmaActionsPanel({
  role,
  isVisible,
  isBusy = false,
  isReadOnlyYear = false,
  onTemporarySave,
  onFinalSubmit,
  onReturnForCorrection,
}: YpodeigmaActionsPanelProps) {
  if (!isVisible) {
    return (
      <aside className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-500">Ενέργειες</h2>
          <p className="text-sm text-slate-500">
            {role === 'admin'
              ? 'Οι ενέργειες του διαχειριστή θα εμφανιστούν μόλις επιλεγούν έτος, μονάδα και μοίρα.'
              : 'Οι ενέργειες θα εμφανιστούν μόλις επιλεγούν έτος, μονάδα και μοίρα.'}
          </p>
        </div>
      </aside>
    );
  }

  if (role !== 'admin' && isReadOnlyYear) {
    return (
      <aside className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-500">Ενέργειες</h2>
          <p className="text-sm text-slate-500">
            Το επιλεγμένο έτος είναι μόνο για προβολή, οπότε δεν υπάρχουν διαθέσιμες ενέργειες.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-sky-800">Ενέργειες</h2>
        <p className="mt-1 text-sm text-slate-500">
          Επιλέξτε την ενέργεια που θέλετε να εκτελέσετε για το τρέχον υπόδειγμα.
        </p>
      </div>

      <div className="space-y-3">
        {role === 'admin' ? (
          <button
            type="button"
            onClick={() => void onReturnForCorrection?.()}
            disabled={isBusy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:scale-100"
          >
            <ReturnIcon />
            {isBusy ? 'Επεξεργασία...' : 'Επιστροφή για Διόρθωση'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void onTemporarySave()}
              disabled={isBusy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:scale-100"
            >
              <PrinterIcon />
              {isBusy ? 'Αποθήκευση...' : 'Προσωρινή Αποθήκευση'}
            </button>

            <button
              type="button"
              onClick={() => void onFinalSubmit?.()}
              disabled={isBusy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:scale-100"
            >
              <PaperPlaneIcon />
              {isBusy ? 'Υποβολή...' : 'Οριστική Υποβολή'}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
