export type Ypodeigma6Row = {
  id: string;
  displayOrder: number;
  description: string;
  sntTotalFlightHours: number | null;
  measurementUnit: string;
  quantity: number | null;
  aircraftSquadron: string;
  aircraftType: string;
  costPerUnit: number | null;
  notes: string;
};

export type Ypodeigma6Config = {
  unit: {
    id: string;
    name: string;
  };
  etos: number;
  status: 'editable' | 'view';
  rows: Ypodeigma6Row[];
};

export type Ypodeigma6SaveRequest = {
  unitId: string;
  etos: number;
  rows: Array<Ypodeigma6Row & { totalCost: number }>;
};

export type Ypodeigma6FormActions = {
  saveDraft: () => Promise<void>;
  submitFinal: () => Promise<void>;
};
