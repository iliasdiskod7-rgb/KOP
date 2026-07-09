export type Ypodeigma1TableARow = {
  id: string;
  code: string;
  title: string;
  amount: number | null;
  analysisLevel?: number;
};

export type Ypodeigma1TableBRow = {
  id: string;
  code: string;
  title: string;
  amount: number | null;
  analysisLevel?: number;
};

export type Ypodeigma1TableCRow = {
  id: string;
  code: string;
  title: string;
  amount: number | null;
  analysisLevel?: number;
};

export type Ypodeigma1MoiraData = {
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
  moiraId: string;
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
  saveDraft: () => void;
  submitFinal: () => void;
};
