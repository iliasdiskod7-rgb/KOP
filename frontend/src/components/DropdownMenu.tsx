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
    <div className="absolute left-0 z-50 mt-2 max-h-64 w-56 origin-top overflow-y-auto rounded-lg border border-slate-100 bg-white text-slate-800 opacity-0 shadow-2xl invisible transition-all duration-300 ease-out -translate-y-3 scale-95 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
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
