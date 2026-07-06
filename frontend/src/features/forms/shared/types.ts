export type OrgUnitOption = {
  id: string;
  name: string;
  type: 'monada' | 'moira';
  parentId?: string | null;
};

export type EtosOption = {
  value: number;
  label: string;
};

export type YpodeigmaControlsValue = {
  monadaId: string | null;
  moiraId: string | null;
  etos: number | null;
  neoEtos: string;
};

export type YpodeigmaControlsOptions = {
  monades: OrgUnitOption[];
  moires: OrgUnitOption[];
  etoi: EtosOption[];
};
