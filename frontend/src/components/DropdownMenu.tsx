interface DropdownMenuProps {
  onSelect: (tab: string) => void;
}

const ypodeigmata = Array.from({ length: 21 }, (_, index) => ({
  key: `ypodeigma${index + 1}`,
  label: `ΥΠΟΔΕΙΓΜΑ ${index + 1}`,
}));

const formOptions = [
  ...ypodeigmata,
  {
    key: 'ypodeigma22',
    label: 'ΠΡΟΣΩΠΙΚΟ',
  },
];

export default function DropdownMenu({ onSelect }: DropdownMenuProps) {
  return (
    <div className="absolute left-full top-0 z-50 ml-2 max-h-72 w-60 origin-left overflow-y-auto rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xl ring-1 ring-slate-100">
      <div className="border-b border-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        Υποδείγματα
      </div>
      <ul className="py-1">
        {formOptions.map((option) => (
          <li key={option.key}>
            <button
              onClick={() => onSelect(option.key)}
              className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-all duration-200 ease-in-out hover:bg-cyan-100 hover:pl-5 hover:text-blue-700"
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
