import type { ChangeEvent, FC } from 'react';
import {
  blockInvalidNumberInput,
  calculateHierarchicalGrandTotal,
  calculateHierarchicalRowTotal,
  formatTitleCase,
  getAmountKey,
  getRowDepth,
  isLeafRow,
} from './helpers';
import type { Ypodeigma2Ale, Ypodeigma2Moira, Ypodeigma2Row, Ypodeigma2SectionConfig } from './types';

function formatAmount(value: number) {
  return new Intl.NumberFormat('el-GR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function buildReviewAleColumns(moires: Ypodeigma2Moira[]) {
  const firstMoira = [...moires].sort((left, right) => left.displayOrder - right.displayOrder)[0];
  return firstMoira ? [...firstMoira.ales].sort((left, right) => left.displayOrder - right.displayOrder) : [];
}

function calculateReviewCellValue(row: Ypodeigma2Row, ale: Ypodeigma2Ale, moires: Ypodeigma2Moira[]) {
  return moires.reduce((total, moira) => {
    const matchingAle = moira.ales.find((candidate) => candidate.displayOrder === ale.displayOrder);

    if (!matchingAle) {
      return total;
    }

    return total + (row.values[getAmountKey(moira.id, matchingAle.id)] ?? 0);
  }, 0);
}

function calculateReviewAleColumnTotal(
  ale: Ypodeigma2Ale,
  rows: Ypodeigma2Row[],
  moires: Ypodeigma2Moira[],
) {
  return rows.reduce((total, row) => total + calculateReviewCellValue(row, ale, moires), 0);
}

type Props = {
  rows: Ypodeigma2Row[];
  sectionId: string;
  sectionTitle: string;
  sharedConfig: Pick<Ypodeigma2SectionConfig, 'analysisLevels' | 'moires'>;
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

const Ypodeigma2Section1BStage: FC<Props> = ({
  rows,
  sectionId,
  sectionTitle,
  sharedConfig,
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
    <div className="space-y-4 p-4">
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
        <table className="w-full table-fixed border-collapse text-[11px] text-slate-800">
          <colgroup>
            <col className="w-24" />
            {analysisLevels.map((level) => (
              <col key={`analysis-col-${level.id}`} className="w-7" />
            ))}
            <col className="w-56" />
            {reviewAleColumns.map((ale) => (
              <col key={`stage-ale-${ale.id}`} className="w-20" />
            ))}
            <col className="w-20" />
          </colgroup>

          <thead>
            <tr>
              <th
                colSpan={leftColumnCount + reviewAleColumns.length + 1}
                className="border border-slate-400 bg-slate-200 px-4 py-3 text-center text-sm font-bold tracking-wide"
              >
                ΥΠΟΔΕΙΓΜΑ 2- 1Β
              </th>
            </tr>
            <tr>
              <th
                colSpan={leftColumnCount + reviewAleColumns.length + 1}
                className="border border-slate-400 bg-white px-4 py-3 text-center font-bold tracking-wide"
              >
                {formatTitleCase(sectionTitle)}
              </th>
            </tr>
            <tr>
              <th rowSpan={4} className="border border-slate-400 bg-white px-3 py-2 text-center font-bold">
                ΚΩΔΙΚΑΣ
              </th>
              <th
                colSpan={analysisLevels.length}
                className="border border-slate-400 bg-white px-3 py-2 text-center font-bold"
              >
                ΕΠΙΠΕΔΟ ΑΝΑΛΥΣΗΣ
              </th>
              <th rowSpan={4} className="border border-slate-400 bg-white px-3 py-2 text-center font-bold">
                ΤΙΤΛΟΣ ΣΤΟΙΧΕΙΟΥ ΚΟΣΤΟΥΣ
              </th>
              <th
                colSpan={reviewAleColumns.length + 1}
                className="border border-slate-400 bg-white px-3 py-2 text-center font-bold"
              >
                Κόστος Οδοιπορικών Μετασταθμεύσεων
              </th>
            </tr>
            <tr>
              {analysisLevels.map((level) => (
                <th
                  key={`analysis-${level.id}`}
                  rowSpan={3}
                  className="border border-slate-400 bg-slate-50 px-2 py-2 text-center font-bold"
                >
                  {level.label}
                </th>
              ))}
              <th
                colSpan={reviewAleColumns.length + 1}
                className="border border-slate-400 bg-slate-50 px-3 py-2 text-center font-bold uppercase"
              >
                ΑΛΕ
              </th>
            </tr>
            <tr>
              {reviewAleColumns.map((ale) => (
                <th
                  key={`stage-ale-code-${ale.id}`}
                  rowSpan={2}
                  className="border border-slate-400 bg-white px-3 py-2 text-center font-semibold"
                >
                  {ale.code}
                </th>
              ))}
              <th rowSpan={2} className="border border-slate-400 bg-orange-100 px-3 py-2 text-center font-bold">
                ΣΥΝ
              </th>
            </tr>
            <tr />
          </thead>

          <tbody>
            {rows.map((row) => {
              const leafRow = isLeafRow(row, rows);
              const depth = getRowDepth(row.code);

              return (
                <tr key={row.id} className={leafRow ? 'bg-white' : 'bg-sky-50'}>
                  <td className="border border-slate-300 px-2 py-1.5">
                    <input
                      type="text"
                      value={row.code}
                      onChange={handleTextChange(row.id, 'code')}
                      className="w-full bg-transparent text-center font-semibold outline-none focus:bg-cyan-50"
                    />
                  </td>

                  {analysisLevels.map((level) => (
                    <td
                      key={`${row.id}-analysis-${level.id}`}
                      className="border border-slate-300 px-1 py-2 text-center text-[11px] font-bold text-slate-700"
                    >
                      {row.analysisLevel === level.value ? 'X' : ''}
                    </td>
                  ))}

                  <td className="border border-slate-300 px-2 py-1.5">
                    <div style={{ paddingLeft: `${depth * 12}px` }}>
                      <input
                        type="text"
                        value={row.costElementTitle}
                        onChange={handleTextChange(row.id, 'costElementTitle')}
                        className="w-full bg-transparent text-[11px] leading-tight outline-none focus:bg-cyan-50"
                      />
                    </div>
                  </td>

                  {reviewAleColumns.map((ale) => (
                    <td
                      key={`${row.id}-stage-${ale.id}`}
                      className={`border border-slate-300 px-2 py-1.5 ${
                        leafRow ? 'bg-white' : 'bg-sky-100'
                      }`}
                    >
                      {leafRow ? (
                        <input
                          type="number"
                          value={(() => {
                            const firstMoira = sharedConfig.moires[0];

                            if (!firstMoira) {
                              return '';
                            }

                            const matchingAle = firstMoira.ales.find(
                              (candidate) => candidate.displayOrder === ale.displayOrder,
                            );

                            if (!matchingAle) {
                              return '';
                            }

                            return row.values[getAmountKey(firstMoira.id, matchingAle.id)] ?? '';
                          })()}
                          onChange={(event) => {
                            const firstMoira = sharedConfig.moires[0];

                            if (!firstMoira) {
                              return;
                            }

                            const matchingAle = firstMoira.ales.find(
                              (candidate) => candidate.displayOrder === ale.displayOrder,
                            );

                            if (!matchingAle) {
                              return;
                            }

                            onAmountChange(row.id, firstMoira.id, matchingAle.id, event.target.value);
                          }}
                          onKeyDown={blockInvalidNumberInput}
                          className="w-full appearance-none bg-transparent text-right text-[11px] outline-none focus:bg-cyan-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      ) : (
                        <div className="min-h-[24px] rounded bg-sky-100" />
                      )}
                    </td>
                  ))}

                  <td
                    className={`border border-slate-300 px-3 py-2 text-right font-bold text-slate-800 ${
                      leafRow ? 'bg-orange-50' : 'bg-sky-100'
                    }`}
                  >
                    {leafRow ? formatAmount(calculateHierarchicalRowTotal(row, rows, sharedConfig.moires)) : ''}
                  </td>
                </tr>
              );
            })}

            <tr className="bg-amber-100">
              <td
                colSpan={leftColumnCount}
                className="border border-slate-400 px-3 py-3 text-right font-bold uppercase tracking-wide"
              >
                ΣΥΝΟΛΟ {sectionId}
              </td>

              {reviewAleColumns.map((ale) => (
                <td
                  key={`stage-sum-${ale.id}`}
                  className="border border-slate-400 px-3 py-3 text-right font-bold"
                >
                  {formatAmount(calculateReviewAleColumnTotal(ale, rows, sharedConfig.moires))}
                </td>
              ))}

              <td className="border border-slate-400 bg-orange-200 px-3 py-3 text-right font-extrabold">
                {formatAmount(calculateHierarchicalGrandTotal(rows, sharedConfig.moires))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ypodeigma2Section1BStage;
