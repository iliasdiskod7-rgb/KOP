export type Ypodeigma5ResponsiblePerson = {
  id: string;
  displayOrder: number;
  referenceTemplate: number | null;
  rank: string;
  militaryRegistryNumber: string;
  fullName: string;
  department: string;
  phone: string;
};

export type Ypodeigma5Config = {
  unit: {
    id: string;
    name: string;
  };
  etos: number;
  status: 'editable' | 'view';
  rows: Ypodeigma5ResponsiblePerson[];
};

export type Ypodeigma5SaveRequest = {
  unitId: string;
  etos: number;
  rows: Array<{
    rowId: string;
    displayOrder: number;
    referenceTemplate: number | null;
    rank: string;
    militaryRegistryNumber: string;
    fullName: string;
    department: string;
    phone: string;
  }>;
};

export type Ypodeigma5FormActions = {
  saveDraft: () => Promise<void>;
  submitFinal: () => Promise<void>;
};
