export type OrgUnitOption = {
  id: string;
  name: string;
  type: 'monada' | 'moira';
  parentId?: string | null;
};

export type YpodeigmaEtosStatus = 'editable' | 'view';

export type EtosOption = {
  value: number;
  label: string;
  status: YpodeigmaEtosStatus;
};

export type YpodeigmaControlsValue = {
  monadaId: string | null;
  moiraId: string | null;
  etos: number | null;
  neoEtos: string;
  etosStatus: YpodeigmaEtosStatus | null;
  etosSource: 'existing' | 'new' | null;
};

export type YpodeigmaControlsOptions = {
  monades: OrgUnitOption[];
  moires: OrgUnitOption[];
  etoi: EtosOption[];
  canStartNewYear: boolean;
};

export type ActionMessage = {
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
};

export type FormActions = {
  saveDraft: () => void | Promise<void>;
  submitFinal: () => void | Promise<void>;
  returnForCorrection?: () => void | Promise<void>;
};

export type NewEtosAvailabilityResult = {
  isAvailable: boolean;
  message: string;
};
