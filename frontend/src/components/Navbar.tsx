import { useEffect, useRef, useState } from 'react';
import KOP from '../assets/KOP.png';
import resultIcon from '../assets/result.png';
import tableIcon from '../assets/table.png';
import DropdownMenu from './DropdownMenu';
import type { AppUserRole } from '../types/auth';

interface NavbarProps {
  activeTab: string;
  onLogout: () => void;
  onTabChange: (tab: string) => void;
  username: string;
  role: AppUserRole;
  orgUnitId?: number;
  orgUnitTitle?: string;
  epistasia?: string;
}

function getSidebarButtonClass(activeTab: string, tab: string) {
  return `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-wide transition-all duration-200 ${
    activeTab === tab
      ? 'bg-white/70 text-sky-800 shadow-sm'
      : 'text-sky-950 hover:bg-white/60 hover:text-sky-700'
  }`;
}

export default function Navbar({
  activeTab,
  onLogout,
  onTabChange,
  username,
  role,
  orgUnitId,
  orgUnitTitle,
  epistasia,
}: NavbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const userPanelTriggerRef = useRef<HTMLDivElement>(null);
  const userPanelContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUserPanelOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (
        userPanelTriggerRef.current?.contains(event.target) ||
        userPanelContentRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsUserPanelOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserPanelOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserPanelOpen]);

  function toggleSidebar() {
    setIsSidebarOpen((isOpen) => {
      const nextIsOpen = !isOpen;

      if (!nextIsOpen) {
        setActiveFlyout(null);
      }

      return nextIsOpen;
    });
  }

  function handleSelect(tab: string) {
    onTabChange(tab);
    setActiveFlyout(null);
    setIsSidebarOpen(false);
  }

  function closeFlyout() {
    setActiveFlyout(null);
  }

  function toggleFlyout() {
    setActiveFlyout((currentFlyout) => (currentFlyout === 'forms' ? null : 'forms'));
  }

  return (
    <>
      <nav className="relative z-40 flex items-center justify-between bg-slate-900 px-6 py-4 font-sans text-white shadow-md">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Άνοιγμα ή κλείσιμο πλαϊνού μενού"
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 transition-all duration-200 hover:scale-105 hover:bg-slate-700"
          >
            <img src={KOP} alt="KOP Logo" className="h-12 w-12 object-contain" />
          </button>
        </div>

        <div
          ref={userPanelTriggerRef}
          className={`flex items-center rounded-xl border bg-slate-800 shadow-sm transition-all duration-300 ${
            isUserPanelOpen
              ? 'border-sky-500/70 shadow-lg shadow-sky-950/20'
              : 'border-slate-700'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsUserPanelOpen((isOpen) => !isOpen)}
            aria-expanded={isUserPanelOpen}
            aria-label="Προβολή στοιχείων συνδεδεμένου χρήστη"
            className="group flex items-center gap-2 px-4 py-2 text-left transition-colors duration-200 hover:bg-slate-700/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400"
          >
            <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-green-500" />
            <span className="max-w-52 truncate text-sm font-bold tracking-wide text-slate-200">
              {username}
            </span>
            <span className="rounded-full border border-slate-600 bg-slate-700/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-200">
              {role}
            </span>
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 text-sky-300 transition-transform duration-300 ${
                isUserPanelOpen ? 'rotate-180' : 'rotate-0'
              }`}
            >
              <path
                d="m6 8 4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="mr-2 rounded-md border border-slate-600 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-100 transition-all duration-200 hover:border-slate-500 hover:bg-slate-700"
          >
            Logout
          </button>
        </div>

        <div
          ref={userPanelContentRef}
          className={`absolute right-6 top-[calc(100%+0.65rem)] z-50 w-[min(24rem,calc(100vw-3rem))] origin-top-right transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isUserPanelOpen
              ? 'pointer-events-auto visible translate-x-0 scale-100 opacity-100'
              : 'pointer-events-none invisible translate-x-10 scale-95 opacity-0'
          }`}
        >
          <div className="overflow-hidden rounded-2xl border border-sky-200 bg-white text-slate-800 shadow-2xl ring-1 ring-sky-100/70">
            <div className="flex items-center gap-3 bg-gradient-to-r from-sky-100 via-cyan-50 to-white px-5 py-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-700 text-base font-black text-white shadow-md">
                {username.trim().charAt(0).toLocaleUpperCase('el-GR') || 'Χ'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-slate-900">{username}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                    Ενεργός χρήστης
                  </span>
                  <span className="rounded-full border border-sky-200 bg-white/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-sky-800">
                    {role}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-sky-700">
                  Μονάδα
                </div>
                <div className="mt-1 break-words text-xs font-semibold text-slate-800">
                  {orgUnitTitle?.trim() || 'Δεν διατίθεται'}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-sky-700">
                  Επιστασία
                </div>
                <div className="mt-1 break-words text-xs font-semibold text-slate-800">
                  {epistasia?.trim() || 'Δεν διατίθεται'}
                </div>
              </div>
            </div>

            {orgUnitId ? (
              <div className="border-t border-slate-100 px-5 py-3 text-[10px] font-semibold tracking-wide text-slate-500">
                Κωδικός οργανωτικής μονάδας: <span className="font-bold text-slate-700">{orgUnitId}</span>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Κλείσιμο πλαϊνού μενού"
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/20"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 overflow-visible bg-sky-200 shadow-xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-sky-300 px-6 py-5">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Κλείσιμο πλαϊνού μενού"
              className="rounded-xl border border-sky-300 bg-white/60 p-2 transition-all duration-200 hover:scale-105 hover:bg-white/80"
            >
              <img src={KOP} alt="KOP Logo" className="h-10 w-10 object-contain" />
            </button>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Μενού</div>
              <div className="text-sm font-semibold text-sky-950">Πλοήγηση Εφαρμογής</div>
            </div>
          </div>

          <nav className="relative flex-1 overflow-visible px-4 py-5">
            <div className="space-y-2 overflow-visible">
              <button
                type="button"
                onClick={() => handleSelect('ypologismos')}
                className={getSidebarButtonClass(activeTab, 'ypologismos')}
              >
                <img src={resultIcon} alt="ΥΠΟΛ ΚΩΠ" className="h-5 w-5 opacity-80" />
                <span>ΥΠΟΛ ΚΩΠ</span>
              </button>

              <div
                className="relative w-full overflow-visible"
                onMouseEnter={() => setActiveFlyout('forms')}
                onMouseLeave={closeFlyout}
              >
                <button
                  type="button"
                  onClick={toggleFlyout}
                  aria-expanded={activeFlyout === 'forms'}
                  className={getSidebarButtonClass(activeTab, 'menu-eis-ded-yp')}
                >
                  <img src={tableIcon} alt="ΕΙΣ ΔΕΔ ΥΠ" className="h-5 w-5 opacity-80" />
                  <span className="flex-1">ΕΙΣ ΔΕΔ ΥΠ</span>
                </button>

                <div
                  className={`absolute left-[calc(100%-8px)] top-0 z-50 transition-all duration-200 ease-out ${
                    activeFlyout === 'forms'
                      ? 'pointer-events-auto visible translate-x-0 opacity-100'
                      : 'pointer-events-none invisible -translate-x-1 opacity-0'
                  }`}
                >
                  <div className="absolute inset-y-0 -left-3 w-3" />
                  <DropdownMenu onSelect={handleSelect} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelect('my-submissions')}
                className={getSidebarButtonClass(activeTab, 'my-submissions')}
              >
                <img src={tableIcon} alt="Οι Υποβολές μου" className="h-5 w-5 opacity-80" />
                <span>ΟΙ ΥΠΟΒΟΛΕΣ ΜΟΥ</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
