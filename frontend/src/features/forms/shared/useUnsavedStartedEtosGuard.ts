import { useCallback, useMemo, useState } from 'react';
import { persistStartedEtos } from './mockYpodeigmaControlsApi';
import type { YpodeigmaControlsValue } from './types';

export type PendingStartedEtos = {
  ypodeigmaId: number;
  monadaId: string;
  etos: number;
};

export type PendingUnsavedAction =
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

type UseUnsavedStartedEtosGuardParams = {
  appliedControlsValue: YpodeigmaControlsValue;
  appliedMonadaLabel: string | null;
  appliedMoiraLabel: string | null;
  getYpodeigmaLabel: (id: number) => string;
  id: number;
};

export function useUnsavedStartedEtosGuard({
  appliedControlsValue,
  appliedMonadaLabel,
  appliedMoiraLabel,
  getYpodeigmaLabel,
  id,
}: UseUnsavedStartedEtosGuardParams) {
  const [pendingStartedEtos, setPendingStartedEtos] = useState<PendingStartedEtos | null>(null);
  const [pendingUnsavedAction, setPendingUnsavedAction] = useState<PendingUnsavedAction | null>(null);

  const pendingUnsavedSummary = useMemo(() => {
    if (!pendingStartedEtos || !appliedControlsValue.etos) {
      return null;
    }

    return `${getYpodeigmaLabel(id)} / ${appliedMonadaLabel ?? '-'} / ${appliedMoiraLabel ?? '-'} / Έτος ${
      appliedControlsValue.etos
    }`;
  }, [appliedControlsValue.etos, appliedMonadaLabel, appliedMoiraLabel, getYpodeigmaLabel, id, pendingStartedEtos]);

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

  const clearPendingUnsavedState = useCallback(() => {
    setPendingStartedEtos(null);
    setPendingUnsavedAction(null);
  }, []);

  return {
    clearPendingUnsavedState,
    pendingStartedEtos,
    pendingUnsavedAction,
    pendingUnsavedSummary,
    persistPendingStartedEtos,
    setPendingStartedEtos,
    setPendingUnsavedAction,
  };
}
