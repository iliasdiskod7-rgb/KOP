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

function getTabButtonClass(activeTab: string, tab: string) {
  return `relative group flex flex-col items-center font-semibold tracking-wide transition-colors duration-300 pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-cyan-500 after:transition-transform after:duration-300 after:origin-left ${
    activeTab === tab
      ? 'text-cyan-500 after:scale-x-100'
      : 'text-black hover:text-cyan-500 after:scale-x-0 hover:after:scale-x-100'
  }`;
}

export default function Navbar({
  activeTab,
  onLogout,
  onTabChange,
  username,
}: NavbarProps) {
  return (
    <nav className="flex items-center justify-between bg-slate-850 px-6 py-4 font-sans text-white shadow-md">
      <div className="flex items-center">
        <img src={KOP} alt="KOP Logo" className="h-12 w-12 object-contain" />
      </div>

      <div className="flex h-full items-center space-x-8">
        <button onClick={() => onTabChange('ypologismos')} className={getTabButtonClass(activeTab, 'ypologismos')}>
          <img
            src={resultIcon}
            alt="Result Icon"
            className="mb-1 h-6 w-6 opacity-80 transition-opacity group-hover:opacity-100"
          />
          <span>ΥΠΟΛ ΚΩΠ</span>
        </button>

        <div className="group relative cursor-pointer py-2">
          <div className="relative flex flex-col items-center pb-1 font-semibold tracking-wide text-black transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-cyan-500 after:transition-transform after:duration-300 after:content-[''] group-hover:text-cyan-500 group-hover:after:scale-x-100">
            <img
              src={tableIcon}
              alt="Table Icon"
              className="mb-1 h-6 w-6 opacity-80 transition-opacity group-hover:opacity-100"
            />
            <span>ΕΙΣ ΔΕΔ ΥΠ</span>
          </div>

          <DropdownMenu onSelect={onTabChange} />
        </div>

        <button
          onClick={() => onTabChange('my-submissions')}
          className={getTabButtonClass(activeTab, 'my-submissions')}
        >
          <img
            src={tableIcon}
            alt="Submissions Icon"
            className="mb-1 h-6 w-6 opacity-80 transition-opacity group-hover:opacity-100"
          />
          <span>Οι Υποβολές μου</span>
        </button>
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
    </nav>
  );
}
