import { useState } from 'react';
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
}: NavbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);

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

        <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-sm font-bold tracking-wide text-slate-200">{username}</span>
            <span className="rounded-full border border-slate-600 bg-slate-700/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-200">
              {role}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="rounded-md border border-slate-600 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-100 transition-colors hover:bg-slate-700"
          >
            Logout
          </button>
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
