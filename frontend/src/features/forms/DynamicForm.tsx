import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppUserRole } from '../../types/auth';
import ProsopikoForm from './prosopiko/ProsopikoForm';
import YpodeigmaActionMessage from './shared/YpodeigmaActionMessage';
import YpodeigmaActionsPanel from './shared/YpodeigmaActionsPanel';
import YpodeigmaControlsPanel from './shared/YpodeigmaControlsPanel';
import {
  checkNewEtosAvailability,
  fetchYpodeigmaControlsOptions,
  persistStartedEtos,
  startNewEtos,
} from './shared/mockYpodeigmaControlsApi';
import type {
  ActionMessage,
  YpodeigmaControlsOptions,
  YpodeigmaControlsValue,
} from './shared/types';
import Ypodeigma1Form from './ypodeigma1/Ypodeigma1Form';
import type { Ypodeigma1FormActions } from './ypodeigma1/types';
import Ypodeigma2Form from './ypodeigma2/Ypodeigma2Form';
import Ypodeigma3Form from './ypodeigma3/Ypodeigma3Form';
import Ypodeigma4Form from './ypodeigma4/Ypodeigma4Form';

interface DynamicFormProps {
  id: number;
  role: AppUserRole;
}

type FlashMessage = {
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
};

type PendingStartedEtos = {
  ypodeigmaId: number;
  monadaId: string;
  etos: number;
};

type PendingUnsavedAction =
  | {
      type: 'retrieve';
      nextValue: YpodeigmaControlsValue;
    }
  | {
      type: 'start-new-year';
    }
  | {
      type: 'tab-change';
      targetTab: string;
    };

type DynamicFormWindow = Window & {
  __kopUnsavedGuard?: {
    continueWithoutSaving: () => void;
    hasUnsavedChanges: boolean;
    submitFinal: () => Promise<void>;
    summary: string;
    temporarySave: () => Promise<void>;
  };
};

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

function upsertEtosOption(
  options: YpodeigmaControlsOptions,
  nextEtosOption: YpodeigmaControlsOptions['etoi'][number],
): YpodeigmaControlsOptions {
  const filteredEtoi = options.etoi.filter((option) => option.value !== nextEtosOption.value);

  return {
    ...options,
    etoi: [...filteredEtoi, nextEtosOption].sort((left, right) => left.value - right.value),
  };
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

function buildFlashMessage(title: string, description: string): FlashMessage {
  return {
    type: 'success',
    title,
    description,
  };
}

function buildSubmissionDescription(destinationLabel: string, context: string) {
  return `Η εγγραφή για ${context} αποθηκεύτηκε επιτυχώς και μεταφέρθηκε στην κατηγορία ${destinationLabel}.`;
}

function buildUnavailableActionMessage(title: string, ypodeigmaLabel: string): ActionMessage {
  return {
    type: 'info',
    title,
    description: `Το ${ypodeigmaLabel} δεν έχει συνδεθεί ακόμη με τη συγκεκριμένη ενέργεια.`,
  };
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-4 w-4 fill-current transition-transform ${isOpen ? 'rotate-180' : ''}`}
    >
      <path d="m12 15.4-6.7-6.7 1.4-1.4 5.3 5.3 5.3-5.3 1.4 1.4Z" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M5 3h11l3 3v15H5V3Zm2 2v14h10V7.5L15.5 5H15v4H9V5H7Zm4 0v2h2V5h-2Zm-2 8h6v2H9v-2Z" />
    </svg>
  );
}

function SubmitIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M3.4 11.1 20.7 3.7a.8.8 0 0 1 1.1.9l-3 14.6a.8.8 0 0 1-1.3.5l-4.4-3.6-2.6 2.5a.8.8 0 0 1-1.3-.5v-4.2L3.9 12.5a.8.8 0 0 1-.5-.7.8.8 0 0 1 .5-.7Z" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M9.4 6.3 4.7 11l4.7 4.7 1.4-1.4-2.3-2.3H15a3 3 0 0 1 0 6h-4v2h4a5 5 0 0 0 0-10H8.5l2.3-2.3-1.4-1.4Z" />
    </svg>
  );
}

export default function DynamicForm({ id, role }: DynamicFormProps) {
  const navigate = useNavigate();
  const [controlsValue, setControlsValue] = useState<YpodeigmaControlsValue>(EMPTY_CONTROLS_VALUE);
  const [appliedControlsValue, setAppliedControlsValue] =
    useState<YpodeigmaControlsValue>(EMPTY_CONTROLS_VALUE);
  const [controlsOptions, setControlsOptions] =
    useState<YpodeigmaControlsOptions>(EMPTY_CONTROLS_OPTIONS);
  const [isControlsLoading, setIsControlsLoading] = useState(true);
  const [isStartingNewYear, setIsStartingNewYear] = useState(false);
  const [isActionRunning, setIsActionRunning] = useState(false);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [pendingStartedEtos, setPendingStartedEtos] = useState<PendingStartedEtos | null>(null);
  const [pendingUnsavedAction, setPendingUnsavedAction] = useState<PendingUnsavedAction | null>(null);
  const [shouldResumeStartNewYear, setShouldResumeStartNewYear] = useState(false);

  const [ypodeigma1SaveDraftAction, setYpodeigma1SaveDraftAction] = useState<(() => void) | null>(
    null,
  );
  const [ypodeigma1SubmitFinalAction, setYpodeigma1SubmitFinalAction] = useState<(() => void) | null>(
    null,
  );
  const [ypodeigma2SaveDraftAction, setYpodeigma2SaveDraftAction] = useState<(() => void) | null>(
    null,
  );
  const [ypodeigma2SubmitFinalAction, setYpodeigma2SubmitFinalAction] = useState<
    (() => void) | null
  >(null);
  const [ypodeigma2ReturnAction, setYpodeigma2ReturnAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    setControlsValue(EMPTY_CONTROLS_VALUE);
    setAppliedControlsValue(EMPTY_CONTROLS_VALUE);
    setActionMessage(null);
    setIsControlsCollapsed(false);
    setPendingStartedEtos(null);
    setPendingUnsavedAction(null);
    setShouldResumeStartNewYear(false);
    setYpodeigma1SaveDraftAction(null);
    setYpodeigma1SubmitFinalAction(null);
    setYpodeigma2SaveDraftAction(null);
    setYpodeigma2SubmitFinalAction(null);
    setYpodeigma2ReturnAction(null);
  }, [id]);

  const handleRegisterYpodeigma1Actions = useCallback((actions: Ypodeigma1FormActions | null) => {
    setYpodeigma1SaveDraftAction(() => actions?.saveDraft ?? null);
    setYpodeigma1SubmitFinalAction(() => actions?.submitFinal ?? null);
  }, []);

  const handleRegisterYpodeigma2SaveDraftAction = useCallback((action: (() => void) | null) => {
    setYpodeigma2SaveDraftAction(() => action);
  }, []);

  const handleRegisterYpodeigma2SubmitFinalAction = useCallback((action: (() => void) | null) => {
    setYpodeigma2SubmitFinalAction(() => action);
  }, []);

  const handleRegisterYpodeigma2ReturnAction = useCallback((action: (() => void) | null) => {
    setYpodeigma2ReturnAction(() => action);
  }, []);

  const handleControlsChange = useCallback(
    (nextValue: YpodeigmaControlsValue) => {
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
    },
    [controlsOptions],
  );

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

  const hasDraftSelection = Boolean(
    controlsValue.etos && controlsValue.monadaId && controlsValue.moiraId,
  );
  const hasAppliedSelection = Boolean(
    appliedControlsValue.etos &&
      appliedControlsValue.monadaId &&
      appliedControlsValue.moiraId,
  );

  useEffect(() => {
    if (!hasDraftSelection) {
      setIsControlsCollapsed(false);
    }
  }, [hasDraftSelection]);

  const navigateToMySubmissions = useCallback(
    (flashMessage: FlashMessage) => {
      navigate('/dashboard/my-submissions', {
        replace: false,
        state: {
          flashMessage,
          flashKey: Date.now(),
        },
      });
    },
    [navigate],
  );

  const executeAction = useCallback(
    async (
      action: (() => void) | null,
      errorTitle = 'Η ενέργεια δεν είναι διαθέσιμη.',
    ) => {
      if (!action) {
        setActionMessage({
          type: 'error',
          title: errorTitle,
          description: 'Δεν υπάρχει διαθέσιμη ενέργεια για το τρέχον υπόδειγμα.',
        });
        return false;
      }

      setActionMessage(null);
      setIsActionRunning(true);

      try {
        await Promise.resolve(action());
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
    },
    [],
  );

  const persistPendingStartedEtos = useCallback(
    (state: 'temporary-saved' | 'submitted') => {
      if (!pendingStartedEtos) {
        return;
      }

      persistStartedEtos({
        ypodeigmaId: pendingStartedEtos.ypodeigmaId,
        monadaId: pendingStartedEtos.monadaId,
        etos: pendingStartedEtos.etos,
        state,
      });
      setPendingStartedEtos(null);
    },
    [pendingStartedEtos],
  );

  const completePendingUnsavedAction = useCallback(() => {
    if (!pendingUnsavedAction) {
      return;
    }

    if (pendingUnsavedAction.type === 'retrieve') {
      handleControlsChange(pendingUnsavedAction.nextValue);
      setAppliedControlsValue(pendingUnsavedAction.nextValue);
      setActionMessage({
        type: 'info',
        title: 'Η ανάκτηση ολοκληρώθηκε.',
        description: `Φορτώθηκαν τα διαθέσιμα στοιχεία για ${buildSelectionContext(
          id,
          controlsOptions,
          pendingUnsavedAction.nextValue,
        )}.`,
      });
      setIsControlsCollapsed(true);
      setPendingUnsavedAction(null);
      return;
    }

    if (pendingUnsavedAction.type === 'start-new-year') {
      setPendingUnsavedAction(null);
      setShouldResumeStartNewYear(true);
      return;
    }

    const nextTargetTab = pendingUnsavedAction.targetTab;
    setPendingUnsavedAction(null);

    if (nextTargetTab === 'ypologismos') {
      navigate('/dashboard/ypologismos');
      return;
    }

    if (nextTargetTab === 'my-submissions') {
      navigate('/dashboard/my-submissions');
      return;
    }

    const nextId = nextTargetTab.replace('ypodeigma', '');
    navigate(`/dashboard/ypodeigma/${nextId}`);
  }, [controlsOptions, handleControlsChange, id, navigate, pendingUnsavedAction]);

  const handleContinueWithoutSaving = useCallback(() => {
    setPendingStartedEtos(null);
    completePendingUnsavedAction();
  }, [completePendingUnsavedAction]);

  const handleRetrieve = useCallback(() => {
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

    const nextAppliedValue: YpodeigmaControlsValue = {
      ...controlsValue,
      monadaId: nextMonadaId,
      moiraId: nextMoiraId,
      etosStatus: controlsValue.etosStatus ?? getYearStatus(controlsOptions, controlsValue.etos),
      etosSource: controlsValue.etosSource ?? 'existing',
    };

    if (pendingStartedEtos) {
      setPendingUnsavedAction({
        type: 'retrieve',
        nextValue: nextAppliedValue,
      });
      return;
    }

    handleControlsChange(nextAppliedValue);
    setAppliedControlsValue(nextAppliedValue);

    setActionMessage({
      type: 'info',
      title: 'Η ανάκτηση ολοκληρώθηκε.',
      description: `Φορτώθηκαν τα διαθέσιμα στοιχεία για ${buildSelectionContext(
        id,
        controlsOptions,
        nextAppliedValue,
      )}.`,
    });
    setIsControlsCollapsed(true);
  }, [controlsOptions, controlsValue, handleControlsChange, id, pendingStartedEtos]);

  const handleStartNewYear = useCallback(async () => {
    if (role === 'admin') {
      return;
    }

    if (pendingStartedEtos) {
      setPendingUnsavedAction({
        type: 'start-new-year',
      });
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
        description: 'Δεν βρέθηκε διαθέσιμη μονάδα για τη δημιουργία νέου έτους.',
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

      setControlsOptions((currentOptions) => upsertEtosOption(currentOptions, createdYear.etosOption));

      const nextMoiraId = getFirstMoiraIdForMonada(controlsOptions, nextMonadaId);
      const nextAppliedValue: YpodeigmaControlsValue = {
        ...controlsValue,
        monadaId: nextMonadaId,
        moiraId: nextMoiraId,
        etos: createdYear.etos,
        etosStatus: createdYear.status,
        etosSource: 'new',
        neoEtos: '',
      };

      handleControlsChange(nextAppliedValue);
      setAppliedControlsValue(nextAppliedValue);
      setPendingStartedEtos({
        ypodeigmaId: id,
        monadaId: nextMonadaId,
        etos: createdYear.etos,
      });
      setIsControlsCollapsed(true);
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
  }, [controlsOptions, controlsValue, handleControlsChange, id, pendingStartedEtos, role]);

  useEffect(() => {
    if (!shouldResumeStartNewYear) {
      return;
    }

    setShouldResumeStartNewYear(false);
    void handleStartNewYear();
  }, [handleStartNewYear, shouldResumeStartNewYear]);

  const handleTemporarySave = useCallback(async () => {
    const context = buildSelectionContext(id, controlsOptions, appliedControlsValue);

    if (id === 1) {
      const isSuccess = await executeAction(ypodeigma1SaveDraftAction);

      if (!isSuccess) {
        return;
      }

      persistPendingStartedEtos('temporary-saved');
      setPendingUnsavedAction(null);
      navigateToMySubmissions(
        buildFlashMessage(
          'Η προσωρινή αποθήκευση ολοκληρώθηκε.',
          `Η εγγραφή για ${context} αποθηκεύτηκε προσωρινά στην κατηγορία ΠΡΟΣ ΥΠΟΒΟΛΗ.`,
        ),
      );
      return;
    }

    if (id === 2) {
      const isSuccess = await executeAction(ypodeigma2SaveDraftAction);

      if (!isSuccess) {
        return;
      }

      persistPendingStartedEtos('temporary-saved');
      setPendingUnsavedAction(null);
      navigateToMySubmissions(
        buildFlashMessage(
          'Η προσωρινή αποθήκευση ολοκληρώθηκε.',
          buildSubmissionDescription('ΠΡΟΣ ΥΠΟΒΟΛΗ', context),
        ),
      );
      return;
    }

    setActionMessage(
      buildUnavailableActionMessage(
        'Η προσωρινή αποθήκευση δεν είναι ακόμη διαθέσιμη.',
        getYpodeigmaLabel(id),
      ),
    );
  }, [
    appliedControlsValue,
    controlsOptions,
    executeAction,
    id,
    navigateToMySubmissions,
    persistPendingStartedEtos,
    ypodeigma1SaveDraftAction,
    ypodeigma2SaveDraftAction,
  ]);

  const handleFinalSubmit = useCallback(async () => {
    const context = buildSelectionContext(id, controlsOptions, appliedControlsValue);

    if (id === 1) {
      const isSuccess = await executeAction(ypodeigma1SubmitFinalAction);

      if (!isSuccess) {
        return;
      }

      persistPendingStartedEtos('submitted');
      setPendingUnsavedAction(null);
      navigateToMySubmissions(
        buildFlashMessage(
          'Η οριστική υποβολή ολοκληρώθηκε.',
          `Η εγγραφή για ${context} μεταφέρθηκε στην κατηγορία ΥΠΟΒΛΗΘΕΙΣΕΣ.`,
        ),
      );
      return;
    }

    if (id === 2) {
      const isSuccess = await executeAction(ypodeigma2SubmitFinalAction);

      if (!isSuccess) {
        return;
      }

      persistPendingStartedEtos('submitted');
      setPendingUnsavedAction(null);
      navigateToMySubmissions(
        buildFlashMessage(
          'Η οριστική υποβολή ολοκληρώθηκε.',
          buildSubmissionDescription('ΥΠΟΒΛΗΘΕΙΣΕΣ', context),
        ),
      );
      return;
    }

    setActionMessage(
      buildUnavailableActionMessage(
        'Η οριστική υποβολή δεν είναι ακόμη διαθέσιμη.',
        getYpodeigmaLabel(id),
      ),
    );
  }, [
    appliedControlsValue,
    controlsOptions,
    executeAction,
    id,
    navigateToMySubmissions,
    persistPendingStartedEtos,
    ypodeigma1SubmitFinalAction,
    ypodeigma2SubmitFinalAction,
  ]);

  const handleReturnForCorrection = useCallback(async () => {
    const context = buildSelectionContext(id, controlsOptions, appliedControlsValue);

    if (id === 2) {
      const isSuccess = await executeAction(ypodeigma2ReturnAction);

      if (!isSuccess) {
        return;
      }

      navigateToMySubmissions(
        buildFlashMessage(
          'Η επιστροφή για διόρθωση ολοκληρώθηκε.',
          buildSubmissionDescription('ΕΠΙΣΤΡΟΦΗ ΓΙΑ ΔΙΟΡΘΩΣΗ', context),
        ),
      );
      return;
    }

    setActionMessage(
      buildUnavailableActionMessage(
        'Η επιστροφή για διόρθωση δεν είναι ακόμη διαθέσιμη.',
        getYpodeigmaLabel(id),
      ),
    );
  }, [
    appliedControlsValue,
    controlsOptions,
    executeAction,
    id,
    navigateToMySubmissions,
    ypodeigma2ReturnAction,
  ]);

  const appliedMonadaLabel =
    controlsOptions.monades.find((monada) => monada.id === appliedControlsValue.monadaId)?.name ??
    null;
  const appliedMoiraLabel =
    controlsOptions.moires.find((moira) => moira.id === appliedControlsValue.moiraId)?.name ?? null;

  const shouldShowSharedActions = id !== 22;
  const shouldShowActionsPanel = shouldShowSharedActions && hasAppliedSelection;
  const canShowUserActions =
    shouldShowActionsPanel && role !== 'admin' && appliedControlsValue.etosStatus !== 'view';
  const canShowAdminActions = shouldShowActionsPanel && role === 'admin';
  const showCollapsedSummary = hasAppliedSelection && isControlsCollapsed;

  const summaryItems = [
    appliedControlsValue.etos ? `Έτος ${appliedControlsValue.etos}` : null,
    appliedMonadaLabel ? `Μονάδα ${appliedMonadaLabel}` : null,
    appliedMoiraLabel ? `Μοίρα ${appliedMoiraLabel}` : null,
  ].filter(Boolean) as string[];
  const pendingUnsavedSummary =
    pendingStartedEtos && appliedControlsValue.etos
      ? `${getYpodeigmaLabel(id)} / ${appliedMonadaLabel ?? '-'} / ${appliedMoiraLabel ?? '-'} / Έτος ${
          appliedControlsValue.etos
        }`
      : null;

  useEffect(() => {
    const guardedWindow = window as DynamicFormWindow;

    if (!pendingStartedEtos || role === 'admin') {
      delete guardedWindow.__kopUnsavedGuard;
      return;
    }

    guardedWindow.__kopUnsavedGuard = {
      hasUnsavedChanges: true,
      summary: pendingUnsavedSummary ?? getYpodeigmaLabel(id),
      temporarySave: async () => {
        await handleTemporarySave();
      },
      submitFinal: async () => {
        await handleFinalSubmit();
      },
      continueWithoutSaving: () => {
        handleContinueWithoutSaving();
      },
    };

    return () => {
      delete guardedWindow.__kopUnsavedGuard;
    };
  }, [
    handleContinueWithoutSaving,
    handleFinalSubmit,
    handleTemporarySave,
    id,
    pendingStartedEtos,
    pendingUnsavedSummary,
    role,
  ]);

  let formContent: ReactNode;

  if (id === 1) {
    formContent = (
      <Ypodeigma1Form
        selectedMonadaId={appliedControlsValue.monadaId}
        selectedMonadaLabel={appliedMonadaLabel}
        selectedMoiraId={appliedControlsValue.moiraId}
        selectedMoiraLabel={appliedMoiraLabel}
        selectedEtos={appliedControlsValue.etos}
        selectedEtosStatus={appliedControlsValue.etosStatus}
        selectedEtosSource={appliedControlsValue.etosSource}
        onRegisterActions={handleRegisterYpodeigma1Actions}
      />
    );
  } else if (id === 2) {
    formContent = (
      <Ypodeigma2Form
        role={role}
        selectedMonadaLabel={appliedMonadaLabel}
        selectedMoiraId={appliedControlsValue.moiraId}
        selectedMoiraLabel={appliedMoiraLabel}
        selectedEtos={appliedControlsValue.etos}
        selectedEtosStatus={appliedControlsValue.etosStatus}
        selectedEtosSource={appliedControlsValue.etosSource}
        onRegisterReturnForCorrection={handleRegisterYpodeigma2ReturnAction}
        onRegisterSaveDraft={handleRegisterYpodeigma2SaveDraftAction}
        onRegisterSubmitFinal={handleRegisterYpodeigma2SubmitFinalAction}
      />
    );
  } else if (id === 3) {
    formContent = (
      <Ypodeigma3Form
        selectedMonadaId={appliedControlsValue.monadaId}
        selectedMonadaLabel={appliedMonadaLabel}
        selectedMoiraId={appliedControlsValue.moiraId}
        selectedMoiraLabel={appliedMoiraLabel}
        selectedEtos={appliedControlsValue.etos}
        selectedEtosStatus={appliedControlsValue.etosStatus}
        selectedEtosSource={appliedControlsValue.etosSource}
      />
    );
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
      {pendingUnsavedAction ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xl font-black text-amber-600">
                !
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-slate-900">Δεν έχετε αποθηκεύσει τα δεδομένα σας</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Υπάρχει νέο έτος σε εκκρεμότητα για το οποίο δεν έγινε ακόμη προσωρινή αποθήκευση ή
                  οριστική υποβολή.
                </p>
                {pendingUnsavedSummary ? (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {pendingUnsavedSummary}
                  </div>
                ) : null}
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Επιλέξτε αν θέλετε να αποθηκεύσετε τώρα ή να συνεχίσετε χωρίς αποθήκευση.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  void handleTemporarySave();
                }}
                disabled={isActionRunning}
                className="inline-flex items-center justify-center rounded-xl border border-blue-500 bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-300"
              >
                Προσωρινή Αποθήκευση
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleFinalSubmit();
                }}
                disabled={isActionRunning}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
              >
                Οριστική Υποβολή
              </button>

              <button
                type="button"
                onClick={handleContinueWithoutSaving}
                disabled={isActionRunning}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                Συνέχεια χωρίς αποθήκευση
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="mb-3 space-y-2">
        <div
          aria-hidden={!showCollapsedSummary}
          className={`origin-top overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            showCollapsedSummary
              ? 'max-h-48 translate-y-0 scale-y-100 opacity-100'
              : 'pointer-events-none max-h-0 -translate-y-1 scale-y-95 opacity-0'
          }`}
        >
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700">
                  Ενεργή προβολή
                </div>

                {summaryItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {canShowUserActions ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        void handleTemporarySave();
                      }}
                      disabled={isActionRunning}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-500 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-300 disabled:hover:translate-y-0 disabled:hover:scale-100"
                    >
                      <SaveIcon />
                      Προσωρινή Αποθήκευση
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void handleFinalSubmit();
                      }}
                      disabled={isActionRunning}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:hover:translate-y-0 disabled:hover:scale-100"
                    >
                      <SubmitIcon />
                      Οριστική Υποβολή
                    </button>
                  </>
                ) : null}

                {canShowAdminActions ? (
                  <button
                    type="button"
                    onClick={() => {
                      void handleReturnForCorrection();
                    }}
                    disabled={isActionRunning}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:hover:translate-y-0 disabled:hover:scale-100"
                  >
                    <ReturnIcon />
                    Επιστροφή για Διόρθωση
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setIsControlsCollapsed(false)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Αλλαγή επιλογών
                  <ChevronIcon isOpen={false} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          aria-hidden={showCollapsedSummary}
          className={`origin-top overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            showCollapsedSummary
              ? 'pointer-events-none max-h-0 -translate-y-2 scale-y-95 opacity-0'
              : 'max-h-[1200px] translate-y-0 scale-y-100 opacity-100'
          }`}
        >
          <div className="grid gap-2.5 xl:grid-cols-[minmax(0,2.35fr)_minmax(320px,0.95fr)] xl:items-start">
            <div className="transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
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
            </div>

            {shouldShowSharedActions ? (
              <div className="transition-all duration-500 delay-75 ease-[cubic-bezier(0.22,1,0.36,1)]">
                <YpodeigmaActionsPanel
                  role={role}
                  isVisible={shouldShowActionsPanel}
                  isBusy={isActionRunning}
                  isReadOnlyYear={appliedControlsValue.etosStatus === 'view'}
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
              </div>
            ) : null}
          </div>
        </div>

        {actionMessage ? <YpodeigmaActionMessage message={actionMessage} /> : null}
      </section>

      {formContent}
    </>
  );
}
