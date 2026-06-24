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

export default function Navbar({
  activeTab,
  onLogout,
  onTabChange,
  username,
}: NavbarProps) {
  const tabButtonClass = `relative group flex flex-col items-center font-semibold tracking-wide transition-colors duration-300 pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-cyan-500 after:transition-transform after:duration-300 after:origin-left ${
    activeTab === 'ypologismos'
      ? 'text-cyan-500 after:scale-x-100'
      : 'text-black hover:text-cyan-500 after:scale-x-0 hover:after:scale-x-100'
  }`;

  return (
    <nav className="w-full bg-slate-850 text-white shadow-md px-6 py-4 flex items-center justify-between font-sans">
      <div className="flex items-center">
        <img src={KOP} alt="KOP Logo" className="w-12 h-12 object-contain" />
      </div>

      <div className="flex items-center space-x-8 h-full">
        <button onClick={() => onTabChange('ypologismos')} className={tabButtonClass}>
          <img
            src={resultIcon}
            alt="Result Icon"
            className="w-6 h-6 mb-1 opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <span>ΥΠΟΛ ΚΩΠ</span>
        </button>

        <div className="relative group cursor-pointer py-2">
          <div className="relative flex flex-col items-center font-semibold tracking-wide text-black group-hover:text-cyan-500 transition-colors duration-300 pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-cyan-500 after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
            <img
              src={tableIcon}
              alt="Table Icon"
              className="w-6 h-6 mb-1 opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <span>ΕΙΣ ΔΕΔ ▼</span>
          </div>

          <DropdownMenu onSelect={onTabChange} />
        </div>
      </div>

      <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
