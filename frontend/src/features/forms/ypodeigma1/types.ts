export type Ypodeigma1TableARow = {
  id: string;
  stoixeioKostousId?: number;
  code: string;
  title: string;
  amount: number | null;
  analysisLevel?: number;
};

export type Ypodeigma1TableBRow = {
  id: string;
  stoixeioKostousId?: number;
  code: string;
  title: string;
  amount: number | null;
  analysisLevel?: number;
};

export type Ypodeigma1TableCRow = {
  id: string;
  stoixeioKostousId?: number;
  code: string;
  title: string;
  amount: number | null;
  analysisLevel?: number;
};

export type Ypodeigma1MoiraData = {
  responsibleOrgUnitId: number | null;
  monadaId: string;
  monadaLabel: string;
  moiraId: string;
  moiraLabel: string;
  etos: number | null;
  status: 'editable' | 'view';
  table1ARows: Ypodeigma1TableARow[];
  table1BRows: Ypodeigma1TableBRow[];
  table1CRows: Ypodeigma1TableCRow[];
};

export type Ypodeigma1MoiraCacheEntry = {
  responsibleOrgUnitId: number | null;
  monadaId: string;
  monadaLabel: string;
  moiraId: string;
  moiraLabel: string;
  etos: number | null;
  status: 'editable' | 'view';
  table1ARows: Ypodeigma1TableARow[];
  table1BRows: Ypodeigma1TableBRow[];
  table1CRows: Ypodeigma1TableCRow[];
};

export type Ypodeigma1CacheByMoira = Record<string, Ypodeigma1MoiraCacheEntry>;

export type FetchYpodeigma1ForMoiraParams = {
  monadaId: string;
  monadaLabel?: string | null;
  moiraId: string;
  moiraLabel?: string | null;
  etos: number | null;
  etosStatus: 'editable' | 'view' | null;
  etosSource: 'existing' | 'new' | null;
};

export type Ypodeigma1SavePayload = {
  monadaId: string | null;
  etos: number | null;
  moires: Array<{
    moiraId: string;
    monadaId: string;
    table1ARows: Ypodeigma1TableARow[];
    table1BRows: Ypodeigma1TableBRow[];
    table1CRows: Ypodeigma1TableCRow[];
  }>;
};

export type Ypodeigma1FormActions = {
  saveDraft: () => void | Promise<void>;
  submitFinal: () => void | Promise<void>;
};
