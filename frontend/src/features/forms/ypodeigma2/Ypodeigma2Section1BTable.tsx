import type { ChangeEvent, FC } from 'react';
import {
  blockInvalidNumberInput,
  calculateCellValue,
  calculateHierarchicalGrandTotal,
  formatTitleCase,
  getAmountKey,
  getRowDepth,
  isLeafRow,
} from './helpers';
import type { Ypodeigma2Ale, Ypodeigma2Row, Ypodeigma2SectionConfig } from './types';

type Props = {
  rows: Ypodeigma2Row[];
  sectionId: string;
  sectionTitle: string;
  sharedConfig: Pick<Ypodeigma2SectionConfig, 'analysisLevels' | 'moires'>;
  isEditable: boolean;
  onRowTextChange: (
    rowId: Ypodeigma2Row['id'],
    field: 'code' | 'costElementTitle',
    value: string,
  ) => void;
  onAmountChange: (
    rowId: Ypodeigma2Row['id'],
    moiraId: string | number,
    aleId: string | number,
    rawValue: string,
  ) => void;
};

function formatAmount(value: number) {
  return new Intl.NumberFormat('el-GR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function buildReviewAleColumns(moires: Ypodeigma2SectionConfig['moires']) {
  const firstMoira = [...moires].sort((left, right) => left.displayOrder - right.displayOrder)[0];
  return firstMoira ? [...firstMoira.ales].sort((left, right) => left.displayOrder - right.displayOrder) : [];
}

function calculateReviewCellValue(
  row: Ypodeigma2Row,
  ale: Ypodeigma2Ale,
  moires: Ypodeigma2SectionConfig['moires'],
) {
  return moires.reduce((total, moira) => {
    const matchingAle = moira.ales.find((candidate) => candidate.displayOrder === ale.displayOrder);

    if (!matchingAle) {
      return total;
    }

    return total + (row.values[getAmountKey(moira.id, matchingAle.id)] ?? 0);
  }, 0);
}

function calculateReviewRowTotal(
  row: Ypodeigma2Row,
  rows: Ypodeigma2Row[],
  aleColumns: Ypodeigma2Ale[],
  moires: Ypodeigma2SectionConfig['moires'],
) {
  if (aleColumns.length === 0) {
    return 0;
  }

  return aleColumns.reduce((total, ale) => {
    const firstMoira = moires[0];

    if (!firstMoira) {
      return total;
    }

    const matchingAle = firstMoira.ales.find((candidate) => candidate.displayOrder === ale.displayOrder);

    if (!matchingAle) {
      return total;
    }

    return total + calculateCellValue(row, rows, firstMoira.id, matchingAle.id);
  }, 0);
}

function calculateReviewAleColumnTotal(
  ale: Ypodeigma2Ale,
  rows: Ypodeigma2Row[],
  moires: Ypodeigma2SectionConfig['moires'],
) {
  return rows.reduce((total, row) => total + calculateReviewCellValue(row, ale, moires), 0);
}

const Ypodeigma2Section1BTable: FC<Props> = ({
  rows,
  sectionId,
  sectionTitle,
  sharedConfig,
  isEditable,
  onRowTextChange,
  onAmountChange,
}) => {
  const reviewAleColumns = buildReviewAleColumns(sharedConfig.moires);
  const analysisLevels = [...sharedConfig.analysisLevels].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  );
  const leftColumnCount = 2 + analysisLevels.length;

  const handleTextChange =
    (rowId: Ypodeigma2Row['id'], field: 'code' | 'costElementTitle') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      onRowTextChange(rowId, field, event.target.value);
    };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-300 bg-slate-50">
      <table className="w-full table-fixed border-collapse text-[9px] text-slate-800">
        <colgroup>
          <col className="w-24" />
          {analysisLevels.map((level) => (
            <col key={`analysis-col-${level.id}`} className="w-7" />
          ))}
          <col className="w-56" />
          {reviewAleColumns.map((ale) => (
            <col key={`review-ale-${ale.id}`} className="w-20" />
          ))}
          <col className="w-20" />
        </colgroup>

        <thead>
          <tr>
            <th
              colSpan={leftColumnCount + reviewAleColumns.length + 1}
              className="border border-slate-400 bg-slate-200 px-2 py-1.5 text-center text-[12px] font-bold uppercase tracking-wide"
            >
              ΥΠΟΔΕΙΓΜΑ 2- 1Β
            </th>
          </tr>
          <tr>
            <th
              colSpan={leftColumnCount + reviewAleColumns.length + 1}
              className="border border-slate-400 bg-white px-2 py-1.5 text-center text-[10px] font-bold tracking-wide"
            >
              {formatTitleCase(sectionTitle)}
            </th>
          </tr>
          <tr>
            <th rowSpan={4} className="border border-slate-400 bg-white px-1.5 py-1 text-center font-bold">
              ΚΩΔΙΚΑΣ
            </th>
            <th
              colSpan={analysisLevels.length}
              className="border border-slate-400 bg-white px-1.5 py-1 text-center font-bold"
            >
              ΕΠΙΠΕΔΟ ΑΝΑΛΥΣΗΣ
            </th>
            <th rowSpan={4} className="border border-slate-400 bg-white px-1.5 py-1 text-center font-bold">
              ΤΙΤΛΟΣ ΣΤΟΙΧΕΙΟΥ ΚΟΣΤΟΥΣ
            </th>
            <th
              colSpan={reviewAleColumns.length + 1}
              className="border border-slate-400 bg-white px-1.5 py-1 text-center font-bold"
            >
              Κόστος Οδοιπορικών Μετασταθμεύσεων
            </th>
          </tr>
          <tr>
            {analysisLevels.map((level) => (
              <th
                key={`analysis-${level.id}`}
                rowSpan={3}
                className="border border-slate-400 bg-slate-50 px-1 py-1 text-center font-bold"
              >
                {level.label}
              </th>
            ))}
            <th
              colSpan={reviewAleColumns.length + 1}
              className="border border-slate-400 bg-slate-50 px-1.5 py-1 text-center font-bold uppercase"
            >
              ΑΛΕ
            </th>
          </tr>
          <tr>
            {reviewAleColumns.map((ale) => (
              <th
                key={`review-ale-code-${ale.id}`}
                rowSpan={2}
                className="border border-slate-400 bg-white px-1.5 py-1 text-center font-semibold"
              >
                {ale.code}
              </th>
            ))}
            <th rowSpan={2} className="border border-slate-400 bg-orange-100 px-1.5 py-1 text-center font-bold">
              ΣΥΝ
            </th>
          </tr>
          <tr />
        </thead>

        <tbody>
          {rows.map((row) => {
            const depth = getRowDepth(row.code);
            const leafRow = isLeafRow(row, rows);

            return (
              <tr key={row.id} className="bg-white">
                <td className="border border-slate-300 px-1 py-0.5">
                  <input
                    type="text"
                    value={row.code}
                    onChange={handleTextChange(row.id, 'code')}
                    disabled={!isEditable}
                    className={`w-full bg-transparent text-center font-semibold outline-none ${
                      isEditable ? 'focus:bg-cyan-50' : 'cursor-not-allowed text-slate-500'
                    }`}
                  />
                </td>

                {analysisLevels.map((level) => (
                  <td
                    key={`${row.id}-analysis-${level.id}`}
                    className="border border-slate-300 px-0.5 py-1 text-center text-[9px] font-bold text-slate-700"
                  >
                    {row.analysisLevel === level.value ? 'X' : ''}
                  </td>
                ))}

                <td className="border border-slate-300 px-1 py-0.5">
                  <div style={{ paddingLeft: `${depth * 12}px` }}>
                    <input
                      type="text"
                      value={row.costElementTitle}
                      onChange={handleTextChange(row.id, 'costElementTitle')}
                      disabled={!isEditable}
                      className={`w-full bg-transparent text-[9px] leading-tight outline-none ${
                        isEditable ? 'focus:bg-cyan-50' : 'cursor-not-allowed text-slate-500'
                      }`}
                    />
                  </div>
                </td>

                {reviewAleColumns.map((ale) => {
                  const firstMoira = sharedConfig.moires[0];
                  const matchingAle = firstMoira?.ales.find(
                    (candidate) => candidate.displayOrder === ale.displayOrder,
                  );

                  return (
                    <td
                      key={`${row.id}-review-${ale.id}`}
                      className={`border border-slate-300 px-1 py-0.5 text-right font-semibold text-sky-900 ${
                        leafRow ? 'bg-white' : 'bg-sky-100'
                      }`}
                    >
                      {leafRow && firstMoira && matchingAle ? (
                        <input
                          type="number"
                          value={row.values[getAmountKey(firstMoira.id, matchingAle.id)] ?? ''}
                          onChange={(event) =>
                            onAmountChange(row.id, firstMoira.id, matchingAle.id, event.target.value)
                          }
                          onKeyDown={blockInvalidNumberInput}
                          disabled={!isEditable}
                          className={`w-full appearance-none bg-transparent text-right text-[9px] outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                            isEditable ? 'focus:bg-cyan-50' : 'cursor-not-allowed text-slate-500'
                          }`}
                        />
                      ) : null}
                    </td>
                  );
                })}

                <td
                  className={`border border-slate-300 px-1.5 py-1 text-right font-bold text-slate-800 ${
                    leafRow ? 'bg-orange-50' : 'bg-sky-100'
                  }`}
                >
                  {leafRow
                    ? formatAmount(calculateReviewRowTotal(row, rows, reviewAleColumns, sharedConfig.moires))
                    : ''}
                </td>
              </tr>
            );
          })}

          <tr className="bg-amber-100">
            <td
              colSpan={leftColumnCount}
              className="border border-slate-400 px-1.5 py-1.5 text-right font-bold uppercase tracking-wide"
            />

            {reviewAleColumns.map((ale) => (
              <td
                key={`review-sum-${ale.id}`}
                className="border border-slate-400 px-1.5 py-1.5 text-right font-bold"
              >
                {formatAmount(calculateReviewAleColumnTotal(ale, rows, sharedConfig.moires))}
              </td>
            ))}

            <td className="border border-slate-400 bg-orange-200 px-1.5 py-1.5 text-right font-extrabold">
              {formatAmount(calculateHierarchicalGrandTotal(rows, sharedConfig.moires))}
            </td>
          </tr>

          <tr className="bg-orange-50">
            <td
              colSpan={leftColumnCount}
              className="border border-slate-400 px-1.5 py-1.5 text-right font-bold uppercase tracking-wide"
            >
              Σύνολο {sectionId}
            </td>

            <td
              colSpan={reviewAleColumns.length}
              className="border border-slate-400 px-1.5 py-1.5 text-right font-semibold text-slate-700"
            />

            <td className="border border-slate-400 bg-orange-300 px-1.5 py-1.5 text-right font-extrabold text-slate-900">
              {formatAmount(calculateHierarchicalGrandTotal(rows, sharedConfig.moires))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Ypodeigma2Section1BTable;
