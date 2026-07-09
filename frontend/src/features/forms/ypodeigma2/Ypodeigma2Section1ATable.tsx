import { useMemo, type FC } from 'react';
import {
  blockInvalidNumberInput,
  calculateHierarchicalAleColumnTotal,
  calculateHierarchicalGrandTotal,
  calculateHierarchicalMoiraTotal,
  calculateHierarchicalRowTotal,
  formatTitleCase,
  getAmountKey,
  getRowDepth,
  isLeafRow,
} from './helpers';
import type { Ypodeigma2Row, Ypodeigma2SectionConfig } from './types';

type Props = {
  rows: Ypodeigma2Row[];
  section: Ypodeigma2SectionConfig;
  isEditable: boolean;
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

function buildTopTableColumnCount(
  leftColumnCount: number,
  moires: Ypodeigma2SectionConfig['moires'],
) {
  return leftColumnCount + moires.reduce((count, moira) => count + moira.ales.length + 1, 0);
}

const Ypodeigma2Section1ATable: FC<Props> = ({ rows, section, isEditable, onAmountChange }) => {
  const analysisLevels = useMemo(
    () => [...section.analysisLevels].sort((left, right) => left.displayOrder - right.displayOrder),
    [section.analysisLevels],
  );
  const leftColumnCount = 2 + analysisLevels.length;
  const topTableColumnCount = useMemo(
    () => buildTopTableColumnCount(leftColumnCount, section.moires),
    [leftColumnCount, section.moires],
  );
  const section1AGrandTotal = useMemo(
    () => calculateHierarchicalGrandTotal(rows, section.moires),
    [rows, section.moires],
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-300 bg-slate-50">
      <table className="w-full table-fixed border-collapse text-[9px] text-slate-800">
        <colgroup>
          <col className="w-24" />
          {analysisLevels.map((level) => (
            <col key={`top-analysis-col-${level.id}`} className="w-7" />
          ))}
          <col className="w-64" />
          {section.moires.flatMap((moira) => [
            ...moira.ales.map((ale) => <col key={`top-${moira.id}-${ale.id}`} className="w-20" />),
            <col key={`top-syn-${moira.id}`} className="w-20" />,
          ])}
        </colgroup>

        <thead>
          <tr>
            <th
              colSpan={topTableColumnCount}
              className="border border-slate-400 bg-slate-200 px-2 py-1.5 text-center text-[12px] font-bold"
            >
              ΥΠΟΔΕΙΓΜΑ 2- 1Α
            </th>
          </tr>
          <tr>
            <th
              colSpan={topTableColumnCount}
              className="border border-slate-400 bg-white px-2 py-1.5 text-center text-[10px] font-bold tracking-wide"
            >
              {formatTitleCase(section.sectionTitle)}
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
              colSpan={section.moires.reduce((count, moira) => count + moira.ales.length + 1, 0)}
              className="border border-slate-400 bg-white px-1.5 py-1 text-center font-bold"
            >
              Κόστος Οδοιπορικών Μετασταθμεύσεων
            </th>
          </tr>
          <tr>
            {analysisLevels.map((level) => (
              <th
                key={`top-analysis-${level.id}`}
                rowSpan={3}
                className="border border-slate-400 bg-slate-50 px-1 py-1 text-center font-bold"
              >
                {level.label}
              </th>
            ))}

            {section.moires.map((moira) => (
              <th
                key={`top-moira-${moira.id}`}
                colSpan={moira.ales.length + 1}
                className="border border-slate-400 bg-slate-50 px-1.5 py-1 text-center font-bold uppercase"
              >
                {moira.label}
              </th>
            ))}
          </tr>
          <tr>
            {section.moires.flatMap((moira) => [
              <th
                key={`top-moira-ale-${moira.id}`}
                colSpan={moira.ales.length}
                className="border border-slate-400 bg-slate-100 px-1.5 py-1 text-center font-bold uppercase"
              >
                ΑΛΕ
              </th>,
              <th
                key={`top-moira-syn-${moira.id}`}
                rowSpan={2}
                className="border border-slate-400 bg-orange-100 px-1.5 py-1 text-center font-bold"
              >
                ΣΥΝ
              </th>,
            ])}
          </tr>
          <tr>
            {section.moires.flatMap((moira) =>
              moira.ales.map((ale) => (
                <th
                  key={`top-ale-${moira.id}-${ale.id}`}
                  className="border border-slate-400 bg-white px-1.5 py-1 text-center font-semibold"
                >
                  {ale.code}
                </th>
              )),
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const depth = getRowDepth(row.code);
            const leafRow = isLeafRow(row, rows);

            return (
              <tr key={`top-row-${row.id}`} className="bg-white">
                <td className="border border-slate-300 px-1.5 py-1 text-center font-semibold">{row.code}</td>

                {analysisLevels.map((level) => (
                  <td
                    key={`top-${row.id}-analysis-${level.id}`}
                    className="border border-slate-300 px-0.5 py-1 text-center font-bold text-slate-700"
                  >
                    {row.analysisLevel === level.value ? 'x' : ''}
                  </td>
                ))}

                <td className="border border-slate-300 px-1.5 py-1 text-[9px] leading-tight">
                  <div style={{ paddingLeft: `${depth * 12}px` }}>{row.costElementTitle}</div>
                </td>

                {section.moires.flatMap((moira) => [
                  ...moira.ales.map((ale) => {
                    const amountKey = getAmountKey(moira.id, ale.id);
                    const value = row.values[amountKey];

                    return (
                      <td
                        key={`top-${row.id}-${moira.id}-${ale.id}`}
                        className={`border border-slate-300 px-1 py-0.5 text-right ${
                          leafRow ? 'bg-white' : 'bg-sky-100'
                        }`}
                      >
                        {leafRow ? (
                          <input
                            type="number"
                            value={value ?? ''}
                            onKeyDown={blockInvalidNumberInput}
                            onChange={(event) => onAmountChange(row.id, moira.id, ale.id, event.target.value)}
                            disabled={!isEditable}
                            className={`w-full appearance-none bg-transparent text-right text-[9px] outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                              isEditable ? 'focus:bg-cyan-50' : 'cursor-not-allowed text-slate-500'
                            }`}
                          />
                        ) : null}
                      </td>
                    );
                  }),
                  <td
                    key={`top-${row.id}-${moira.id}-syn`}
                    className={`border border-slate-300 px-1.5 py-1 text-right font-bold text-slate-800 ${
                      leafRow ? 'bg-orange-50' : 'bg-sky-100'
                    }`}
                  >
                    {leafRow ? formatAmount(calculateHierarchicalRowTotal(row, rows, [moira])) : ''}
                  </td>,
                ])}
              </tr>
            );
          })}

          <tr className="bg-amber-100">
            <td
              colSpan={leftColumnCount}
              className="border border-slate-400 px-1.5 py-1.5 text-right font-bold uppercase tracking-wide"
            />

            {section.moires.flatMap((moira) => [
              ...moira.ales.map((ale) => (
                <td
                  key={`top-sum-${moira.id}-${ale.id}`}
                  className="border border-slate-400 px-1.5 py-1.5 text-right font-bold"
                >
                  {formatAmount(calculateHierarchicalAleColumnTotal(moira.id, ale.id, rows))}
                </td>
              )),
              <td
                key={`top-sum-${moira.id}-syn`}
                className="border border-slate-400 bg-orange-200 px-1.5 py-1.5 text-right font-extrabold"
              >
                {formatAmount(calculateHierarchicalMoiraTotal(moira, rows))}
              </td>,
            ])}
          </tr>

          <tr className="bg-orange-50">
            <td
              colSpan={leftColumnCount}
              className="border border-slate-400 px-1.5 py-1.5 text-right font-bold uppercase tracking-wide"
            >
              Σύνολο 1Α
            </td>

            <td
              colSpan={section.moires.reduce((count, moira) => count + moira.ales.length, 0)}
              className="border border-slate-400 px-1.5 py-1.5 text-right font-semibold text-slate-700"
            />

            <td
              colSpan={section.moires.length}
              className="border border-slate-400 bg-orange-300 px-1.5 py-1.5 text-right font-extrabold text-slate-900"
            >
              {formatAmount(section1AGrandTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Ypodeigma2Section1ATable;
