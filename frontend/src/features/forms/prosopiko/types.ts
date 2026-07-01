export type ProsopikoMovementType = 'Τοποθέτηση' | 'Απόσπαση';

export type ProsopikoRow = {
  id: string;
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
  movementType: ProsopikoMovementType;
  imeres: number;
};

export type ProsopikoClassificationOption = {
  code: string;
  description: string;
};
