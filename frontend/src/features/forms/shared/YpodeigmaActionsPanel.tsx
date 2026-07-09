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

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M12 2 4 5v6c0 5.2 3.4 10 8 11 4.6-1 8-5.8 8-11V5l-8-3Zm1 13h-2v-4H8V9h3V6h2v3h3v2h-3v4Z" />
    </svg>
  );
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
      <aside className="rounded-[20px] border border-slate-200 bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        <div className="mb-2 flex items-center gap-2 text-sky-700">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50">
            <ShieldIcon />
          </div>
          <h2 className="text-sm font-bold text-sky-700">Ενέργειες</h2>
        </div>

        <p className="text-xs leading-6 text-slate-500">
          Οι ενέργειες θα εμφανιστούν μόλις επιλεγούν έτος, μονάδα και μοίρα.
        </p>
      </aside>
    );
  }

  if (role !== 'admin' && isReadOnlyYear) {
    return (
      <aside className="rounded-[20px] border border-slate-200 bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        <div className="mb-2 flex items-center gap-2 text-sky-700">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50">
            <ShieldIcon />
          </div>
          <h2 className="text-sm font-bold text-sky-700">Ενέργειες</h2>
        </div>

        <p className="text-xs leading-6 text-slate-500">
          Το επιλεγμένο έτος είναι διαθέσιμο μόνο για προβολή.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-[20px] border border-slate-200 bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="mb-2 flex items-center gap-2 text-sky-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50">
          <ShieldIcon />
        </div>
        <h2 className="text-sm font-bold text-sky-700">Ενέργειες</h2>
      </div>

      <div className="space-y-1.5">
        {role === 'admin' ? (
          <button
            type="button"
            onClick={() => void onReturnForCorrection?.()}
            disabled={isBusy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
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
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500 bg-white px-4 py-1.5 text-[13px] font-semibold text-blue-700 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-blue-50 hover:shadow-md disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-300 disabled:hover:translate-y-0 disabled:hover:scale-100"
            >
              <PrinterIcon />
              {isBusy ? 'Αποθήκευση...' : 'Προσωρινή Αποθήκευση'}
            </button>

            <button
              type="button"
              onClick={() => void onFinalSubmit?.()}
              disabled={isBusy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-1.5 text-[13px] font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:hover:translate-y-0 disabled:hover:scale-100"
            >
              <PaperPlaneIcon />
              {isBusy ? 'Υποβολή...' : 'Οριστική Υποβολή'}
            </button>
          </>
        )}
      </div>

      <p className="mt-2 text-[10px] leading-4.5 text-slate-500">
        {role === 'admin'
          ? 'Ο διαχειριστής μπορεί μόνο να επιστρέψει την εγγραφή για διόρθωση.'
          : 'Η αποθήκευση και η υποβολή αφορούν όλα τα δεδομένα των επιτρεπόμενων Μονάδων, όχι μόνο των πινάκων που προβάλλονται αυτή τη στιγμή.'}
      </p>
    </aside>
  );
}
