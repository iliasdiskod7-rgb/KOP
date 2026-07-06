export type Ypodeigma1TableARow = {
  id: string;
  code: string;
  title: string;
  amount: number | null;
};

export type Ypodeigma1TableBRow = {
  id: string;
  code: string;
  title: string;
  amount: number | null;
};

export type Ypodeigma1MoiraData = {
  monadaId: string;
  monadaLabel: string;
  moiraId: string;
  moiraLabel: string;
  etos: number | null;
  tableARows: Ypodeigma1TableARow[];
  tableBRows: Ypodeigma1TableBRow[];
};

export type Ypodeigma1MoiraCacheEntry = {
  monadaId: string;
  monadaLabel: string;
  moiraId: string;
  moiraLabel: string;
  etos: number | null;
  tableARows: Ypodeigma1TableARow[];
  tableBRows: Ypodeigma1TableBRow[];
};

export type Ypodeigma1CacheByMoira = Record<string, Ypodeigma1MoiraCacheEntry>;

export type FetchYpodeigma1ForMoiraParams = {
  monadaId: string;
  moiraId: string;
  etos: number | null;
};

export type Ypodeigma1SavePayload = {
  monadaId: string | null;
  etos: number | null;
  moires: Array<{
    moiraId: string;
    monadaId: string;
    tableARows: Ypodeigma1TableARow[];
    tableBRows: Ypodeigma1TableBRow[];
  }>;
};

export type Ypodeigma1FormActions = {
  saveDraft: () => void;
  submitFinal: () => void;
};
