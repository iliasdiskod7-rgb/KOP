import { useState } from 'react';
import KOP from '../assets/KOP.png';
import resultIcon from '../assets/result.png';
import tableIcon from '../assets/table.png';
import DropdownMenu from './DropdownMenu';

interface NavbarProps {
  activeTab: string;
  onLogout: () => void;
  onTabChange: (tab: string) => void;
  username: string;
}

function getVerticalButtonClass(activeTab: string, tab: string) {
  return `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-wide transition-all duration-200 ${
    activeTab === tab
      ? 'bg-cyan-100 text-cyan-700 shadow-sm'
      : 'text-slate-700 hover:bg-slate-100 hover:text-cyan-700'
  }`;
}

export default function Navbar({
  activeTab,
  onLogout,
  onTabChange,
  username,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSelect = (tab: string) => {
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  return (
    <nav className="relative flex items-center justify-between bg-slate-850 px-6 py-4 font-sans text-white shadow-md">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-100 transition-all duration-200 hover:bg-slate-700"
          aria-label="Άνοιγμα μενού"
        >
          <div className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
          </div>
        </button>

        <img src={KOP} alt="KOP Logo" className="h-12 w-12 object-contain" />
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-sm font-bold tracking-wide text-slate-200">{username}</span>
        </div>

        <button
          onClick={onLogout}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-100 transition-colors hover:bg-slate-700"
        >
          Logout
        </button>
      </div>

      {isMenuOpen ? (
        <div className="absolute left-6 top-[calc(100%+12px)] z-40 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-slate-100">
          <div className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Μενού
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleSelect('ypologismos')}
              className={getVerticalButtonClass(activeTab, 'ypologismos')}
            >
              <img src={resultIcon} alt="ΥΠΟΛΟ ΚΩΠ" className="h-5 w-5 opacity-80" />
              <span>ΥΠΟΛΟ ΚΩΠ</span>
            </button>

            <div className="group relative">
              <button
                type="button"
                className={getVerticalButtonClass(activeTab, 'menu-eis-ded-yp')}
              >
                <img src={tableIcon} alt="ΕΙΣ ΔΕΔ ΥΠ" className="h-5 w-5 opacity-80" />
                <span className="flex-1">ΕΙΣ ΔΕΔ ΥΠ</span>
                <span className="text-xs text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5">
                  ›
                </span>
              </button>

              <div className="invisible absolute left-full top-0 ml-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <DropdownMenu onSelect={handleSelect} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelect('my-submissions')}
              className={getVerticalButtonClass(activeTab, 'my-submissions')}
            >
              <img src={tableIcon} alt="Οι Υποβολές Μου" className="h-5 w-5 opacity-80" />
              <span>ΟΙ ΥΠΟΒΟΛΕΣ ΜΟΥ</span>
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
