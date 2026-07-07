import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { AppUserRole } from '../../../types/auth';
import { calculateHierarchicalGrandTotal, getAmountKey, isLeafRow } from './helpers';
import { fetchYpodeigma2Section } from './mockYpodeigma2Api';
import { upsertYpodeigma2Submission } from './submissionStorage';
import type { Ypodeigma2AnalysisLevel, Ypodeigma2Row, Ypodeigma2SectionConfig } from './types';
import Ypodeigma2ReviewTable from './Ypodeigma2ReviewTable';

type Ypodeigma2FormProps = {
  role: AppUserRole;
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

export default function Ypodeigma2Form({
  role,
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
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-800">Υπόδειγμα 2</h1>
          <p className="text-sm text-slate-600">
            Εμφανίζεται μόνο η επιλεγμένη μοίρα {selectedMoiraLabel ?? selectedMoiraId}
            {selectedEtos ? ` - Έτος ${selectedEtos}` : ''}
          </p>
        </div>

        {role !== 'admin' ? (
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
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

        <Ypodeigma2ReviewTable
          rows={rows}
          section1BRows={section1BRows}
          section1BTitle={section.section1B.sectionTitle}
          section={section}
          isEditable={isEditable}
          onSection1AAmountChange={(rowId, moiraId, aleId, rawValue) =>
            handleAmountChange(rows, setRows, rowId, getAmountKey(moiraId, aleId), rawValue)
          }
          onSection1BAmountChange={(rowId, moiraId, aleId, rawValue) =>
            handleAmountChange(section1BRows, setSection1BRows, rowId, getAmountKey(moiraId, aleId), rawValue)
          }
          onSection1BTextChange={handleSection1BTextChange}
        />
      </div>
    </section>
  );
}
