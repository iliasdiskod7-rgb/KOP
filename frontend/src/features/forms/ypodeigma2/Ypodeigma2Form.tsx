import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { AppUserRole } from '../../../types/auth';
import { calculateHierarchicalGrandTotal, getAmountKey, isLeafRow } from './helpers';
import { fetchYpodeigma2Section } from './mockYpodeigma2Api';
import { upsertYpodeigma2Submission } from './submissionStorage';
import type { Ypodeigma2AnalysisLevel, Ypodeigma2Row, Ypodeigma2SectionConfig } from './types';
import Ypodeigma2Section1ATable from './Ypodeigma2Section1ATable';
import Ypodeigma2Section1BTable from './Ypodeigma2Section1BTable';

type Ypodeigma2FormProps = {
  role: AppUserRole;
  selectedMonadaLabel: string | null;
  selectedMoiraId: string | null;
  selectedMoiraLabel: string | null;
  selectedEtos: number | null;
  selectedEtosStatus: 'editable' | 'view' | null;
  selectedEtosSource: 'existing' | 'new' | null;
  onRegisterReturnForCorrection?: (action: (() => void) | null) => void;
  onRegisterSaveDraft?: (action: (() => void) | null) => void;
  onRegisterSubmitFinal?: (action: (() => void) | null) => void;
};

function parseAmount(rawValue: string): number | null {
  if (rawValue.trim() === '') {
    return null;
  }

  const normalizedValue = rawValue.replace(',', '.');
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function sortMoires(moires: Ypodeigma2SectionConfig['moires']) {
  return [...moires].sort((left, right) => left.displayOrder - right.displayOrder);
}

function sortRows(rows: Ypodeigma2Row[]) {
  return [...rows].sort((left, right) => left.displayOrder - right.displayOrder);
}

function sortAnalysisLevels(levels: Ypodeigma2AnalysisLevel[]) {
  return [...levels].sort((left, right) => left.displayOrder - right.displayOrder);
}

function formatAmount(value: number) {
  return new Intl.NumberFormat('el-GR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

export default function Ypodeigma2Form({
  role,
  selectedMonadaLabel,
  selectedMoiraId,
  selectedMoiraLabel,
  selectedEtos,
  selectedEtosStatus,
  selectedEtosSource,
  onRegisterReturnForCorrection,
  onRegisterSaveDraft,
  onRegisterSubmitFinal,
}: Ypodeigma2FormProps) {
  const [section, setSection] = useState<Ypodeigma2SectionConfig | null>(null);
  const [rows, setRows] = useState<Ypodeigma2Row[]>([]);
  const [section1BRows, setSection1BRows] = useState<Ypodeigma2Row[]>([]);

  useEffect(() => {
    setSection(null);
    setRows([]);
    setSection1BRows([]);

    if (!selectedMoiraId || !selectedEtos) {
      return;
    }

    let mounted = true;

    fetchYpodeigma2Section({
      sectionId: '1Α',
      moiraId: selectedMoiraId,
      etos: selectedEtos,
      etosStatus: selectedEtosStatus,
      etosSource: selectedEtosSource,
    }).then((config) => {
      if (!mounted) {
        return;
      }

      const sortedMoires = sortMoires(config.moires).map((moira) => ({
        ...moira,
        ales: [...moira.ales].sort((left, right) => left.displayOrder - right.displayOrder),
      }));

      const sortedRows = sortRows(config.rows);
      const sortedAnalysisLevels = sortAnalysisLevels(config.analysisLevels);

      setSection({
        ...config,
        analysisLevels: sortedAnalysisLevels,
        moires: sortedMoires,
        rows: sortedRows,
        section1B: {
          ...config.section1B,
          rows: sortRows(config.section1B.rows),
        },
      });
      setRows(sortedRows);
      setSection1BRows(sortRows(config.section1B.rows));
    });

    return () => {
      mounted = false;
    };
  }, [selectedEtos, selectedEtosSource, selectedEtosStatus, selectedMoiraId]);

  const isEditable = section?.status === 'editable' && role !== 'admin';
  const section1ATotal = section ? calculateHierarchicalGrandTotal(rows, section.moires) : 0;
  const section1BTotal = section ? calculateHierarchicalGrandTotal(section1BRows, section.moires) : 0;

  useEffect(() => {
    if (!onRegisterReturnForCorrection) {
      return;
    }

    if (role !== 'admin' || !section) {
      onRegisterReturnForCorrection(null);
      return;
    }

    onRegisterReturnForCorrection(() => {
      upsertYpodeigma2Submission({
        id: `ypodeigma2-${selectedEtos ?? 'unknown'}-${selectedMoiraId ?? 'unknown'}`,
        createdAt: new Date().toISOString(),
        ypodeigmaLabel: 'Υπόδειγμα 2',
        pterygaLabel: selectedMonadaLabel,
        etos: selectedEtos,
        sectionId: section.sectionId,
        sectionTitle: section.sectionTitle,
        totalAmount: section1ATotal + section1BTotal,
        moiraCount: section.moires.length,
        rowCount: rows.length + section1BRows.length,
        status: 'returned-for-correction',
      });
    });

    return () => {
      onRegisterReturnForCorrection(null);
    };
  }, [
    onRegisterReturnForCorrection,
    role,
    rows.length,
    section,
    section1ATotal,
    section1BRows.length,
    section1BTotal,
    selectedEtos,
    selectedMonadaLabel,
    selectedMoiraId,
  ]);

  useEffect(() => {
    if (!onRegisterSaveDraft) {
      return;
    }

    if (role === 'admin' || !section) {
      onRegisterSaveDraft(null);
      return;
    }

    onRegisterSaveDraft(() => {
      upsertYpodeigma2Submission({
        id: `ypodeigma2-${selectedEtos ?? 'unknown'}-${selectedMoiraId ?? 'unknown'}`,
        createdAt: new Date().toISOString(),
        ypodeigmaLabel: 'Υπόδειγμα 2',
        pterygaLabel: selectedMonadaLabel,
        etos: selectedEtos,
        sectionId: section.sectionId,
        sectionTitle: section.sectionTitle,
        totalAmount: section1ATotal + section1BTotal,
        moiraCount: section.moires.length,
        rowCount: rows.length + section1BRows.length,
        status: 'pending-submission',
      });
    });

    return () => {
      onRegisterSaveDraft(null);
    };
  }, [
    onRegisterSaveDraft,
    role,
    rows.length,
    section,
    section1ATotal,
    section1BRows.length,
    section1BTotal,
    selectedEtos,
    selectedMonadaLabel,
    selectedMoiraId,
  ]);

  useEffect(() => {
    if (!onRegisterSubmitFinal) {
      return;
    }

    if (role === 'admin' || !section) {
      onRegisterSubmitFinal(null);
      return;
    }

    onRegisterSubmitFinal(() => {
      upsertYpodeigma2Submission({
        id: `ypodeigma2-${selectedEtos ?? 'unknown'}-${selectedMoiraId ?? 'unknown'}`,
        createdAt: new Date().toISOString(),
        ypodeigmaLabel: 'Υπόδειγμα 2',
        pterygaLabel: selectedMonadaLabel,
        etos: selectedEtos,
        sectionId: section.sectionId,
        sectionTitle: section.sectionTitle,
        totalAmount: section1ATotal + section1BTotal,
        moiraCount: section.moires.length,
        rowCount: rows.length + section1BRows.length,
        status: 'submitted',
      });
    });

    return () => {
      onRegisterSubmitFinal(null);
    };
  }, [
    onRegisterSubmitFinal,
    role,
    rows.length,
    section,
    section1ATotal,
    section1BRows.length,
    section1BTotal,
    selectedEtos,
    selectedMonadaLabel,
    selectedMoiraId,
  ]);

  const handleAmountChange = (
    currentRows: Ypodeigma2Row[],
    setCurrentRows: Dispatch<SetStateAction<Ypodeigma2Row[]>>,
    rowId: Ypodeigma2Row['id'],
    amountKey: string,
    rawValue: string,
  ) => {
    if (!isEditable) {
      return;
    }

    const targetRow = currentRows.find((row) => row.id === rowId);

    if (!targetRow || !isLeafRow(targetRow, currentRows)) {
      return;
    }

    setCurrentRows((existingRows) =>
      existingRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        return {
          ...row,
          values: {
            ...row.values,
            [amountKey]: parseAmount(rawValue),
          },
        };
      }),
    );
  };

  const handleSection1BTextChange = (
    rowId: Ypodeigma2Row['id'],
    field: 'code' | 'costElementTitle',
    value: string,
  ) => {
    if (!isEditable) {
      return;
    }

    setSection1BRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        return {
          ...row,
          [field]: value,
        };
      }),
    );
  };

  if (!selectedEtos || !selectedMoiraId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Υπόδειγμα 2</h1>
        <p className="mt-4 text-sm text-slate-600">Επιλέξτε έτος και μοίρα για να φορτωθεί το Υπόδειγμα 2.</p>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-600">
          Φόρτωση στοιχείων για {selectedMoiraLabel ?? selectedMoiraId}...
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-lg lg:p-4">
        <div className="mb-2">
          <h1 className="text-lg font-bold text-slate-800">Υπόδειγμα 2</h1>
          <p className="text-xs text-slate-600">
            Εμφανίζεται μόνο η επιλεγμένη μοίρα {selectedMoiraLabel ?? selectedMoiraId}
            {selectedEtos ? ` - Έτος ${selectedEtos}` : ''}
          </p>
        </div>

        {role !== 'admin' ? (
          <div
            className={`mb-2 rounded-xl border px-3 py-2 text-xs ${
              section.status === 'view'
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {selectedEtosSource === 'new'
              ? `Το νέο έτος ${selectedEtos} είναι κενό και editable για νέα καταχώριση.`
              : section.status === 'editable'
                ? `Το έτος ${selectedEtos} έχει mock δεδομένα από backend και είναι editable.`
                : `Το έτος ${selectedEtos} έχει mock δεδομένα από backend και είναι μόνο για προβολή.`}
          </div>
        ) : null}

        <div className="space-y-2.5">
          <Ypodeigma2Section1ATable
            rows={rows}
            section={section}
            isEditable={isEditable}
            onAmountChange={(rowId, moiraId, aleId, rawValue) =>
              handleAmountChange(rows, setRows, rowId, getAmountKey(moiraId, aleId), rawValue)
            }
          />

          <Ypodeigma2Section1BTable
            rows={section1BRows}
            sectionId={section.section1B.sectionId}
            sectionTitle={section.section1B.sectionTitle}
            sharedConfig={{
              analysisLevels: section.analysisLevels,
              moires: section.moires,
            }}
            isEditable={isEditable}
            onRowTextChange={handleSection1BTextChange}
            onAmountChange={(rowId, moiraId, aleId, rawValue) =>
              handleAmountChange(section1BRows, setSection1BRows, rowId, getAmountKey(moiraId, aleId), rawValue)
            }
          />

          <div className="overflow-hidden rounded-2xl border-2 border-sky-300 bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-100 shadow-lg">
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="space-y-0.5">
                <div className="inline-flex rounded-full bg-sky-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-900">
                  Τελικό Σύνολο
                </div>
                <p className="text-base font-extrabold tracking-wide text-slate-900">ΣΥΝΟΛΟ (1Α + 1Β)</p>
                <p className="text-[11px] font-medium text-slate-600">
                  Άθροισμα των τελικών ποσών των δύο παραπάνω πινάκων
                </p>
              </div>

              <div className="min-w-[180px] rounded-xl border border-sky-300 bg-white/80 px-4 py-3 text-right shadow-sm backdrop-blur">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">Ποσό</div>
                <div className="mt-0.5 text-2xl font-extrabold leading-none text-sky-700">
                  {formatAmount(section1ATotal + section1BTotal)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
