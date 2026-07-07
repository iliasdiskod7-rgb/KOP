import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppUserRole } from '../../types/auth';
import ProsopikoForm from './prosopiko/ProsopikoForm';
import YpodeigmaActionMessage from './shared/YpodeigmaActionMessage';
import YpodeigmaActionsPanel from './shared/YpodeigmaActionsPanel';
import YpodeigmaControlsPanel from './shared/YpodeigmaControlsPanel';
import {
  checkNewEtosAvailability,
  fetchYpodeigmaControlsOptions,
  startNewEtos,
} from './shared/mockYpodeigmaControlsApi';
import type { ActionMessage, YpodeigmaControlsOptions, YpodeigmaControlsValue } from './shared/types';
import Ypodeigma1Form from './ypodeigma1/Ypodeigma1Form';
import type { Ypodeigma1FormActions } from './ypodeigma1/types';
import Ypodeigma2Form from './ypodeigma2/Ypodeigma2Form';
import Ypodeigma3Form from './ypodeigma3/Ypodeigma3Form';
import Ypodeigma4Form from './ypodeigma4/Ypodeigma4Form';

interface DynamicFormProps {
  id: number;
  role: AppUserRole;
}

const EMPTY_CONTROLS_VALUE: YpodeigmaControlsValue = {
  monadaId: null,
  moiraId: null,
  etos: null,
  neoEtos: '',
  etosStatus: null,
  etosSource: null,
};

const EMPTY_CONTROLS_OPTIONS: YpodeigmaControlsOptions = {
  monades: [],
  moires: [],
  etoi: [],
};

const EMPTY_YPODEIGMA1_ACTIONS: Ypodeigma1FormActions = {
  saveDraft: () => {},
  submitFinal: () => {},
};

function getFirstMonadaId(options: YpodeigmaControlsOptions): string | null {
  return options.monades[0]?.id ?? null;
}

function getFirstMoiraIdForMonada(
  options: YpodeigmaControlsOptions,
  monadaId: string | null,
): string | null {
  if (!monadaId) {
    return null;
  }

  return options.moires.find((moira) => moira.parentId === monadaId)?.id ?? null;
}

function isMoiraValidForMonada(
  options: YpodeigmaControlsOptions,
  monadaId: string | null,
  moiraId: string | null,
): boolean {
  if (!monadaId || !moiraId) {
    return false;
  }

  return options.moires.some((moira) => moira.id === moiraId && moira.parentId === monadaId);
}

function getYearStatus(
  options: YpodeigmaControlsOptions,
  etos: number | null,
): YpodeigmaControlsValue['etosStatus'] {
  if (!etos) {
    return null;
  }

  return options.etoi.find((option) => option.value === etos)?.status ?? null;
}

function getYpodeigmaLabel(id: number) {
  if (id === 1) {
    return 'Υπόδειγμα 1';
  }

  if (id === 2) {
    return 'Υπόδειγμα 2';
  }

  if (id === 3) {
    return 'Υπόδειγμα 3';
  }

  if (id === 4) {
    return 'Υπόδειγμα 4';
  }

  if (id === 22) {
    return 'Προσωπικό';
  }

  return `Υπόδειγμα ${id}`;
}

function buildSelectionContext(
  id: number,
  options: YpodeigmaControlsOptions,
  value: YpodeigmaControlsValue,
): string {
  const monadaLabel = options.monades.find((monada) => monada.id === value.monadaId)?.name;
  const moiraLabel = options.moires.find((moira) => moira.id === value.moiraId)?.name;
  const parts = [getYpodeigmaLabel(id)];

  if (monadaLabel) {
    parts.push(`Μονάδα ${monadaLabel}`);
  }

  if (moiraLabel) {
    parts.push(`Μοίρα ${moiraLabel}`);
  }

  if (value.etos) {
    parts.push(`Έτος ${value.etos}`);
  }

  return parts.join(' / ');
}

function buildSubmissionSuccessMessage(destinationLabel: string, context: string) {
  return `Η εγγραφή για ${context} αποθηκεύτηκε επιτυχώς και μεταφέρθηκε στην κατηγορία ${destinationLabel}.`;
}

function buildFlashMessage(title: string, description: string) {
  return {
    type: 'success' as const,
    title,
    description,
  };
}

export default function DynamicForm({ id, role }: DynamicFormProps) {
  const navigate = useNavigate();
  const [controlsValue, setControlsValue] = useState<YpodeigmaControlsValue>(EMPTY_CONTROLS_VALUE);
  const [controlsOptions, setControlsOptions] =
    useState<YpodeigmaControlsOptions>(EMPTY_CONTROLS_OPTIONS);
  const [isControlsLoading, setIsControlsLoading] = useState(true);
  const [isStartingNewYear, setIsStartingNewYear] = useState(false);
  const [isActionRunning, setIsActionRunning] = useState(false);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);
  const [ypodeigma2ReturnAction, setYpodeigma2ReturnAction] = useState<(() => void) | null>(null);
  const [, setYpodeigma1Actions] = useState<Ypodeigma1FormActions>(EMPTY_YPODEIGMA1_ACTIONS);

  const handleRegisterYpodeigma2ReturnAction = (action: (() => void) | null) => {
    setYpodeigma2ReturnAction(() => action);
  };

  const handleRegisterYpodeigma2SaveDraftAction = (_action: (() => void) | null) => {};

  const handleRegisterYpodeigma2SubmitFinalAction = (_action: (() => void) | null) => {};

  const handleControlsChange = (nextValue: YpodeigmaControlsValue) => {
    let nextMonadaId = nextValue.monadaId;
    let nextMoiraId = nextValue.moiraId;

    if (nextValue.etos && !nextMonadaId) {
      nextMonadaId = getFirstMonadaId(controlsOptions);
    }

    if (nextMonadaId && !isMoiraValidForMonada(controlsOptions, nextMonadaId, nextMoiraId)) {
      nextMoiraId = getFirstMoiraIdForMonada(controlsOptions, nextMonadaId);
    }

    setControlsValue({
      ...nextValue,
      monadaId: nextMonadaId,
      moiraId: nextMoiraId,
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      setIsControlsLoading(true);

      try {
        const nextOptions = await fetchYpodeigmaControlsOptions();

        if (!isMounted) {
          return;
        }

        setControlsOptions(nextOptions);
        setControlsValue((currentValue) => {
          let nextMonadaId = currentValue.monadaId;
          let nextMoiraId = currentValue.moiraId;

          if (currentValue.etos && !nextMonadaId) {
            nextMonadaId = getFirstMonadaId(nextOptions);
          }

          if (!isMoiraValidForMonada(nextOptions, nextMonadaId, nextMoiraId)) {
            nextMoiraId = getFirstMoiraIdForMonada(nextOptions, nextMonadaId);
          }

          return {
            ...currentValue,
            monadaId: nextMonadaId,
            moiraId: nextMoiraId,
            etosStatus:
              currentValue.etosSource === 'existing'
                ? getYearStatus(nextOptions, currentValue.etos)
                : currentValue.etosStatus,
          };
        });
      } finally {
        if (isMounted) {
          setIsControlsLoading(false);
        }
      }
    };

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetrieve = () => {
    if (!controlsValue.etos) {
      setActionMessage({
        type: 'error',
        title: 'Δεν έγινε ανάκτηση στοιχείων.',
        description: 'Επιλέξτε πρώτα έτος για να ανακτηθούν τα διαθέσιμα δεδομένα.',
      });
      return;
    }

    const nextMonadaId = controlsValue.monadaId ?? getFirstMonadaId(controlsOptions);
    const nextMoiraId = isMoiraValidForMonada(controlsOptions, nextMonadaId, controlsValue.moiraId)
      ? controlsValue.moiraId
      : getFirstMoiraIdForMonada(controlsOptions, nextMonadaId);

    handleControlsChange({
      ...controlsValue,
      monadaId: nextMonadaId,
      moiraId: nextMoiraId,
      etosStatus: controlsValue.etosStatus ?? getYearStatus(controlsOptions, controlsValue.etos),
      etosSource: controlsValue.etosSource ?? 'existing',
    });

    setActionMessage({
      type: 'info',
      title: 'Η ανάκτηση ολοκληρώθηκε.',
      description: `Φορτώθηκαν τα διαθέσιμα στοιχεία για ${buildSelectionContext(id, controlsOptions, {
        ...controlsValue,
        monadaId: nextMonadaId,
        moiraId: nextMoiraId,
      })}.`,
    });
  };

  const handleStartNewYear = async () => {
    if (role === 'admin') {
      return;
    }

    const normalizedYear = controlsValue.neoEtos.trim();
    const parsedYear = Number(normalizedYear);
    const nextMonadaId = controlsValue.monadaId ?? getFirstMonadaId(controlsOptions);

    if (normalizedYear.length !== 4 || !Number.isInteger(parsedYear) || parsedYear <= 0) {
      setActionMessage({
        type: 'error',
        title: 'Δεν έγινε έναρξη νέου έτους.',
        description: 'Το νέο έτος πρέπει να έχει ακριβώς 4 ψηφία.',
      });
      return;
    }

    if (!nextMonadaId) {
      setActionMessage({
        type: 'error',
        title: 'Δεν έγινε έναρξη νέου έτους.',
        description: 'Δεν βρέθηκε διαθέσιμη μονάδα για την έναρξη του νέου έτους.',
      });
      return;
    }

    setActionMessage(null);
    setIsStartingNewYear(true);

    try {
      const availability = await checkNewEtosAvailability({
        ypodeigmaId: id,
        monadaId: nextMonadaId,
        etos: parsedYear,
      });

      if (!availability.isAvailable) {
        setActionMessage({
          type: 'error',
          title: 'Το νέο έτος δεν είναι διαθέσιμο.',
          description: availability.message,
        });
        return;
      }

      const createdYear = await startNewEtos({
        ypodeigmaId: id,
        monadaId: nextMonadaId,
        etos: parsedYear,
      });

      const nextMoiraId = getFirstMoiraIdForMonada(controlsOptions, nextMonadaId);

      handleControlsChange({
        ...controlsValue,
        monadaId: nextMonadaId,
        moiraId: nextMoiraId,
        etos: createdYear.etos,
        etosStatus: createdYear.status,
        etosSource: 'new',
        neoEtos: '',
      });

      setActionMessage({
        type: 'success',
        title: 'Το νέο έτος δημιουργήθηκε επιτυχώς.',
        description: `Δημιουργήθηκε το έτος ${createdYear.etos} για ${buildSelectionContext(id, controlsOptions, {
          ...controlsValue,
          monadaId: nextMonadaId,
          moiraId: nextMoiraId,
          etos: createdYear.etos,
        })}.`,
      });
    } catch (error) {
      console.error(error);
      setActionMessage({
        type: 'error',
        title: 'Αποτυχία έναρξης νέου έτους.',
        description: 'Προέκυψε σφάλμα κατά τη δημιουργία του νέου έτους. Προσπαθήστε ξανά.',
      });
    } finally {
      setIsStartingNewYear(false);
    }
  };

  const handleActionExecution = async ({
    action,
    successTitle,
    successDescription,
  }: {
    action: (() => void) | null;
    successTitle: string;
    successDescription: string;
  }): Promise<boolean> => {
    if (!action) {
      setActionMessage({
        type: 'error',
        title: 'Η ενέργεια δεν είναι διαθέσιμη.',
        description: 'Δεν υπάρχουν ακόμη διαθέσιμα δεδομένα για την εκτέλεση αυτής της ενέργειας.',
      });
      return false;
    }

    setActionMessage(null);
    setIsActionRunning(true);

    try {
      await Promise.resolve(action());

      setActionMessage({
        type: 'success',
        title: successTitle,
        description: successDescription,
      });
      return true;
    } catch (error) {
      console.error(error);
      setActionMessage({
        type: 'error',
        title: 'Η ενέργεια απέτυχε.',
        description: 'Προέκυψε σφάλμα κατά την αποθήκευση. Προσπαθήστε ξανά.',
      });
      return false;
    } finally {
      setIsActionRunning(false);
    }
  };

  const handleTemporarySave = async () => {};

  const handleFinalSubmit = async () => {};

  const handleReturnForCorrection = async () => {
    const context = buildSelectionContext(id, controlsOptions, controlsValue);

    if (id === 2) {
      const isSuccess = await handleActionExecution({
        action: ypodeigma2ReturnAction,
        successTitle: 'Η επιστροφή για διόρθωση ολοκληρώθηκε.',
        successDescription: `Η εγγραφή για ${context} μεταφέρθηκε στην κατηγορία ΕΠΙΣΤΡΟΦΗ ΓΙΑ ΔΙΟΡΘΩΣΗ.`,
      });

      if (isSuccess) {
        navigate('/dashboard/my-submissions', {
          state: {
            flashMessage: buildFlashMessage(
              'Η επιστροφή για διόρθωση ολοκληρώθηκε.',
              buildSubmissionSuccessMessage('ΕΠΙΣΤΡΟΦΗ ΓΙΑ ΔΙΟΡΘΩΣΗ', context),
            ),
          },
        });
      }

      return;
    }

    setActionMessage({
      type: 'info',
      title: 'Η επιστροφή για διόρθωση δεν είναι ακόμη διαθέσιμη.',
      description: `Το ${getYpodeigmaLabel(id)} δεν έχει συνδεθεί ακόμη με διαδικασία επιστροφής.`,
    });
  };

  const selectedMonadaLabel =
    controlsOptions.monades.find((monada) => monada.id === controlsValue.monadaId)?.name ?? null;
  const selectedMoiraLabel =
    controlsOptions.moires.find((moira) => moira.id === controlsValue.moiraId)?.name ?? null;

  const shouldShowSharedActions = id !== 22;
  const shouldShowActionsPanel = shouldShowSharedActions && Boolean(controlsValue.etos && controlsValue.moiraId);

  let formContent: ReactNode;

  if (id === 1) {
    formContent = (
      <Ypodeigma1Form
        selectedMonadaId={controlsValue.monadaId}
        selectedMonadaLabel={selectedMonadaLabel}
        selectedMoiraId={controlsValue.moiraId}
        selectedMoiraLabel={selectedMoiraLabel}
        selectedEtos={controlsValue.etos}
        selectedEtosStatus={controlsValue.etosStatus}
        selectedEtosSource={controlsValue.etosSource}
        onRegisterActions={setYpodeigma1Actions}
      />
    );
  } else if (id === 2) {
    formContent = (
      <Ypodeigma2Form
        role={role}
        selectedMoiraId={controlsValue.moiraId}
        selectedMoiraLabel={selectedMoiraLabel}
        selectedEtos={controlsValue.etos}
        selectedEtosStatus={controlsValue.etosStatus}
        selectedEtosSource={controlsValue.etosSource}
        onRegisterReturnForCorrection={handleRegisterYpodeigma2ReturnAction}
        onRegisterSaveDraft={handleRegisterYpodeigma2SaveDraftAction}
        onRegisterSubmitFinal={handleRegisterYpodeigma2SubmitFinalAction}
      />
    );
  } else if (id === 3) {
    formContent = <Ypodeigma3Form />;
  } else if (id === 4) {
    formContent = <Ypodeigma4Form />;
  } else if (id === 22) {
    formContent = <ProsopikoForm />;
  } else {
    formContent = (
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ {id}</h1>
        <p className="text-slate-600">Η φόρμα για το Υπόδειγμα {id} είναι υπό κατασκευή.</p>
      </div>
    );
  }

  return (
    <>
      <section className="mb-8 space-y-4">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,2.3fr)_minmax(280px,1fr)]">
          <YpodeigmaControlsPanel
            role={role}
            value={controlsValue}
            options={controlsOptions}
            isLoading={isControlsLoading}
            isStartingNewYear={isStartingNewYear}
            onChange={handleControlsChange}
            onRetrieve={handleRetrieve}
            onStartNewYear={() => {
              void handleStartNewYear();
            }}
          />

          {shouldShowSharedActions ? (
            <YpodeigmaActionsPanel
              role={role}
              isVisible={shouldShowActionsPanel}
              isBusy={isActionRunning}
              isReadOnlyYear={controlsValue.etosStatus === 'view'}
              onTemporarySave={() => {
                void handleTemporarySave();
              }}
              onFinalSubmit={() => {
                void handleFinalSubmit();
              }}
              onReturnForCorrection={() => {
                void handleReturnForCorrection();
              }}
            />
          ) : null}
        </div>

        {actionMessage ? <YpodeigmaActionMessage message={actionMessage} /> : null}
      </section>

      {formContent}
    </>
  );
}
