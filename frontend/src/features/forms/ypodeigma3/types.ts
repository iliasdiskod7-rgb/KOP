export type Ypodeigma3EntryScope = 'outside-moires' | 'moira-af-ep';

export type Ypodeigma3Unit = {
  id: string;
  name: string;
};

export type Ypodeigma3Moira = {
  id: string;
  label: string;
  displayOrder: number;
};

export type Ypodeigma3Row = {
  id: string;
  code: string;
  costElementTitle: string;
  displayOrder: number;
  entryScope: Ypodeigma3EntryScope;
  values: Record<string, number | null>;
};

export type Ypodeigma3Config = {
  unit: Ypodeigma3Unit;
  moires: Ypodeigma3Moira[];
  rows: Ypodeigma3Row[];
};
