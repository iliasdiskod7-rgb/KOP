interface DropdownMenuProps {
  onSelect: (tab: string) => void;
}

export default function DropdownMenu({ onSelect }: DropdownMenuProps) {
  return (
    <div className="absolute left-0 mt-2 w-48 max-h-64 overflow-y-auto bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-50 transform origin-top -translate-y-3 group-hover:translate-y-0 scale-95 group-hover:scale-100 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
      <ul className="py-1">
        {Array.from({ length: 21 }, (_, i) => i + 1).map((num) => (
          <li key={num}>
            <button
              onClick={() => onSelect(`ypodeigma${num}`)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-cyan-100 hover:text-blue-700 transition-all duration-200 ease-in-out font-medium text-slate-700 hover:pl-5"
            >
              ΥΠΟΔΕΙΓΜΑ {num}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
