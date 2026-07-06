export type OrgUnitOption = {
  id: string;
  name: string;
  type: 'monada' | 'moira';
  parentId?: string | null;
};

export type EtosOption = {
  value: number;
  label: string;
  status: 'editable' | 'view';
};

export type YpodeigmaControlsValue = {
  monadaId: string | null;
  moiraId: string | null;
  etos: number | null;
  neoEtos: string;
  etosStatus: 'editable' | 'view' | null;
  etosSource: 'existing' | 'new' | null;
};

export type YpodeigmaControlsOptions = {
  monades: OrgUnitOption[];
  moires: OrgUnitOption[];
  etoi: EtosOption[];
};
