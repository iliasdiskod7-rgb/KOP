import { type FC } from 'react';
import { calculateHierarchicalGrandTotal } from './helpers';
import Ypodeigma2Section1ATable from './Ypodeigma2Section1ATable';
import Ypodeigma2Section1BTable from './Ypodeigma2Section1BTable';
import type { Ypodeigma2Row, Ypodeigma2SectionConfig } from './types';

type Props = {
  rows: Ypodeigma2Row[];
  section1BRows: Ypodeigma2Row[];
  section1BTitle: string;
  section: Ypodeigma2SectionConfig;
  isEditable: boolean;
  onSection1AAmountChange: (
    rowId: Ypodeigma2Row['id'],
    moiraId: string | number,
    aleId: string | number,
    rawValue: string,
  ) => void;
  onSection1BAmountChange: (
    rowId: Ypodeigma2Row['id'],
    moiraId: string | number,
    aleId: string | number,
    rawValue: string,
  ) => void;
  onSection1BTextChange: (
    rowId: Ypodeigma2Row['id'],
    field: 'code' | 'costElementTitle',
    value: string,
  ) => void;
};

function formatAmount(value: number) {
  return new Intl.NumberFormat('el-GR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

const Ypodeigma2ReviewTable: FC<Props> = ({
  rows,
  section1BRows,
  section1BTitle,
  section,
  isEditable,
  onSection1AAmountChange,
  onSection1BAmountChange,
  onSection1BTextChange,
}) => {
  const combinedGrandTotal =
    calculateHierarchicalGrandTotal(rows, section.moires) +
    calculateHierarchicalGrandTotal(section1BRows, section.moires);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="mb-2 text-lg font-bold text-slate-800">Συγκεντρωτικός έλεγχος Υποδείγματος 2</h2>
      </div>

      <Ypodeigma2Section1ATable
        rows={rows}
        section={section}
        isEditable={isEditable}
        onAmountChange={onSection1AAmountChange}
      />

      <Ypodeigma2Section1BTable
        rows={section1BRows}
        sectionId={section.section1B.sectionId}
        sectionTitle={section1BTitle}
        sharedConfig={{
          analysisLevels: section.analysisLevels,
          moires: section.moires,
        }}
        isEditable={isEditable}
        onRowTextChange={onSection1BTextChange}
        onAmountChange={onSection1BAmountChange}
      />

      <div className="overflow-hidden rounded-2xl border-2 border-sky-300 bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-100 shadow-lg">
        <div className="flex items-center justify-between gap-6 px-5 py-4">
          <div className="space-y-1">
            <div className="inline-flex rounded-full bg-sky-200 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-900">
              Τελικό Σύνολο
            </div>
            <p className="text-lg font-extrabold tracking-wide text-slate-900">ΣΥΝΟΛΟ (1Α + 1Β)</p>
            <p className="text-xs font-medium text-slate-600">
              Άθροισμα των τελικών ποσών των δύο παραπάνω πινάκων
            </p>
          </div>

          <div className="min-w-[220px] rounded-xl border border-sky-300 bg-white/80 px-5 py-4 text-right shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Ποσό</div>
            <div className="mt-1 text-3xl font-extrabold leading-none text-sky-700">
              {formatAmount(combinedGrandTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ypodeigma2ReviewTable;
