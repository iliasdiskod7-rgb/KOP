import { useEffect, useState, type ReactNode } from 'react';
import ProsopikoForm from './prosopiko/ProsopikoForm';
import YpodeigmaControlsPanel from './shared/YpodeigmaControlsPanel';
import { fetchYpodeigmaControlsOptions } from './shared/mockYpodeigmaControlsApi';
import type { YpodeigmaControlsOptions, YpodeigmaControlsValue } from './shared/types';
import Ypodeigma1Form from './ypodeigma1/Ypodeigma1Form';
import type { Ypodeigma1FormActions } from './ypodeigma1/types';
import Ypodeigma2Form from './ypodeigma2/Ypodeigma2Form';
import Ypodeigma3Form from './ypodeigma3/Ypodeigma3Form';
import Ypodeigma4Form from './ypodeigma4/Ypodeigma4Form';

interface DynamicFormProps {
  id: number;
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
  saveDraft: () => {
    console.log('Δεν υπάρχουν ακόμη δεδομένα προς αποθήκευση για το Υπόδειγμα 1.');
  },
  submitFinal: () => {
    console.log('Δεν υπάρχουν ακόμη δεδομένα προς υποβολή για το Υπόδειγμα 1.');
  },
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

export default function DynamicForm({ id }: DynamicFormProps) {
  const [controlsValue, setControlsValue] = useState<YpodeigmaControlsValue>(EMPTY_CONTROLS_VALUE);
  const [controlsOptions, setControlsOptions] =
    useState<YpodeigmaControlsOptions>(EMPTY_CONTROLS_OPTIONS);
  const [isControlsLoading, setIsControlsLoading] = useState(true);
  const [ypodeigma1Actions, setYpodeigma1Actions] =
    useState<Ypodeigma1FormActions>(EMPTY_YPODEIGMA1_ACTIONS);

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
    console.log('Ανάκτηση στοιχείων υποδείγματος', controlsValue);
  };

  const handleStartNewYear = () => {
    const parsedYear = Number(controlsValue.neoEtos);

    if (!Number.isInteger(parsedYear) || parsedYear <= 0) {
      return;
    }

    handleControlsChange({
      ...controlsValue,
      etos: parsedYear,
      etosStatus: 'editable',
      etosSource: 'new',
    });
  };

  const handleTemporarySave = () => {
    if (id === 1) {
      ypodeigma1Actions.saveDraft();
      return;
    }

    console.log('Προσωρινή αποθήκευση στοιχείων panel', controlsValue);
  };

  const handleFinalSubmit = () => {
    if (id === 1) {
      ypodeigma1Actions.submitFinal();
      return;
    }

    console.log('Οριστική υποβολή στοιχείων panel', controlsValue);
  };

  const selectedMonadaLabel =
    controlsOptions.monades.find((monada) => monada.id === controlsValue.monadaId)?.name ?? null;
  const selectedMoiraLabel =
    controlsOptions.moires.find((moira) => moira.id === controlsValue.moiraId)?.name ?? null;

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
        selectedMoiraId={controlsValue.moiraId}
        selectedMoiraLabel={selectedMoiraLabel}
        selectedEtos={controlsValue.etos}
        selectedEtosStatus={controlsValue.etosStatus}
        selectedEtosSource={controlsValue.etosSource}
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
      <YpodeigmaControlsPanel
        value={controlsValue}
        options={controlsOptions}
        isLoading={isControlsLoading}
        onChange={handleControlsChange}
        onRetrieve={handleRetrieve}
        onStartNewYear={handleStartNewYear}
        onTemporarySave={handleTemporarySave}
        onFinalSubmit={handleFinalSubmit}
      />
      {formContent}
    </>
  );
}
