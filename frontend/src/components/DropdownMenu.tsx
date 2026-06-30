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
    <div className="w-64 overflow-hidden rounded-2xl border border-sky-200 bg-white text-slate-800 shadow-2xl ring-1 ring-sky-100">
      <div className="border-b border-sky-100 bg-sky-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
        Υποδείγματα
      </div>

      <div className="max-h-80 overflow-y-auto py-1">
        {formOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => onSelect(option.key)}
            className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-all duration-200 ease-in-out hover:bg-cyan-100 hover:pl-5 hover:text-blue-700"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
