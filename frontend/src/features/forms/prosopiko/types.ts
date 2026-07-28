export type ProsopikoMovementType = 'Τοποθέτηση' | 'Απόσπαση';

export type ProsopikoRow = {
  id: string;
  displayOrder: number;
  vathmos: string;
  eid: string;
  eponymo: string;
  onoma: string;
  ama: string;
  epiteleioMonadaYpiresia: string;
  kladosMoiraAllo: string;
  dieythynsiEpistasiaAllo: string;
  tmimaGrafeioAllo: string;
  apo: string;
  eos: string;
  taxinomisiKodikaPinaka1Kai62: string;
  movementType: ProsopikoMovementType | null;
  imeres: number | null;
};

export type ProsopikoClassificationOption = {
  code: string;
  description: string;
};

export type ProsopikoConfig = {
  unit: {
    id: string;
    name: string;
  };
  etos: number;
  status: 'editable' | 'view';
  rows: ProsopikoRow[];
};

export type ProsopikoSaveRequest = {
  unitId: string;
  etos: number;
  rows: ProsopikoRow[];
};

export type ProsopikoFormActions = {
  saveDraft: () => Promise<void>;
  submitFinal: () => Promise<void>;
};
